---
title: Building locally
description: Building a linuxlive ISO on your own Linux machine with the same commands CI runs, and boot-testing it in QEMU.
---

You can build an ISO on your own Linux machine with the same commands the GitHub build runs. This suits you if you build often, want to change the pipeline itself, or prefer not to use GitHub. If you only want an ISO, [building in GitHub](/spec/github-actions/) needs nothing installed.

On Windows or macOS you can still **validate** and **compile** a spec and **inspect** an ISO, because those steps are plain Python. Building the image and the ISO needs Linux.

## What you need

- **Linux with root** (`sudo`). GitHub's builds run on Ubuntu 24.04, so that is the tested host; the commands below are for Ubuntu and Debian. On Windows, use WSL2.
- **Python 3.11 or newer.**
- **podman**, **squashfs-tools**, **xorriso**, **grub-pc-bin**, **mtools** and **dosfstools** to build. **qemu-system-x86** and **ovmf** to boot-test.
- **Disk space.** Use peaks around 30 GB for Fedora: during assembly the image, its unpacked file system and the finished ISO all exist at once.
- **An internet connection.** The build downloads the base image, packages and the Flatpak apps from Flathub.
- **KVM** for boot tests, if you can. Without it QEMU emulates the CPU and every boot takes many times longer.

## 1. Install the tools

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  git python3 python3-venv podman \
  squashfs-tools xorriso grub-pc-bin grub-common mtools dosfstools
# For boot tests in QEMU:
sudo apt-get install -y --no-install-recommends qemu-system-x86 qemu-utils ovmf
```

On other distributions, install the equivalents. The assembler looks for `grub-mkimage` or `grub2-mkimage`, and for GRUB's BIOS files in `/usr/lib/grub/i386-pc` or `/usr/lib/grub2/i386-pc`.

## 2. Get the pipeline

```bash
git clone https://github.com/Eric-Ness/linuxlive.git
cd linuxlive
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
```

To build with a particular release, as GitHub does, check out its tag: `git checkout v0.9.1`.

## 3. Build

The steps, with an example spec. Use your own spec's path instead; it can live anywhere.

```bash
python -m linuxlive validate examples/testos-ubuntu.yaml
python -m linuxlive compile examples/testos-ubuntu.yaml -o build/ctx
sudo podman build -t localhost/testos build/ctx
sudo bash scripts/assemble-iso.sh build/ctx localhost/testos build/testos.iso
sudo chown "$(id -u):$(id -g)" build/testos.iso build/testos.iso.sha256 build/testos.iso.packages
```

**Validate** checks the spec; add `--online` to check its Flathub apps too. See [Check it before you build](/spec/#check-it-before-you-build).

**Compile** writes a build context to `build/ctx`: a `Containerfile`, the files to copy into the system (`rootfs/`, with your art and the boot splash), the boot menu (`iso/`), `iso.env` with settings for the assembler, and `linuxlive.json`, the spec as the build resolved it. The output folder is replaced if it exists. Nothing is downloaded yet, and the same spec always gives the same output, so podman's cache stays useful. For a spec with several `arches`, add `--arch arm64` to compile the other one; the default is the first.

**Build the image** with `sudo`: the assembler runs as root and looks for the image in root's podman storage. This installs the base system, the desktop, the kernel and your packages, and runs your build scripts. It takes from a few minutes to half an hour; Fedora takes longest. GitHub's build adds `--pull=newer` to fetch a newer base image when there is one.

**Assemble the ISO.** The assembler exports the image, installs the Flatpak apps, labels the files for SELinux on Fedora, compresses the system to SquashFS and writes a hybrid ISO that boots on BIOS and UEFI (with Secure Boot) from a DVD or a USB stick. It also writes `<iso>.sha256` and `<iso>.packages`, the package list.

You can tune the assembler with environment variables. Put them after `sudo`, because `sudo` drops your environment:

```bash
sudo LL_SQUASHFS_LEVEL=9 LL_RMI_AFTER=1 bash scripts/assemble-iso.sh build/ctx localhost/testos build/testos.iso
```

| Variable | Default | What it does |
| --- | --- | --- |
| `LL_SQUASHFS_LEVEL` | `15` | zstd compression level. Lower is faster to build and a little bigger. GitHub's build uses `9`. |
| `LL_RMI_AFTER` | off | `1` deletes the podman image once it is exported, to free disk space. |
| `LL_KEEP_WORK` | off | `1` keeps the work directory (in `/var/tmp`, or `$TMPDIR` if set) for debugging. |

## 4. Look inside the ISO

```bash
python -m linuxlive inspect-iso build/testos.iso
```

This prints a JSON report of what makes the ISO bootable: the El Torito boot catalog, the MBR and GPT used on a USB stick, and the size of each key file. `--json report.json` also saves it; `--no-checksum` skips the SHA-256 of the whole image, which takes a while. It reads the file directly, so it works on Windows and macOS too.

## 5. Boot-test it

`scripts/boottest.py` is what the GitHub build uses. It boots the ISO in QEMU without a window, watches what the system reports on its serial console, and writes `result.json`, logs and screenshots to the folder you give. It works only with ISOs built by linuxlive.

```bash
python scripts/boottest.py --iso build/testos.iso --mode uefi-usb --session --out build/results/modes/uefi-usb
for mode in uefi-sb-cd uefi-cd bios-cd bios-usb; do
  python scripts/boottest.py --iso build/testos.iso --mode "$mode" --out "build/results/modes/$mode"
done
```

`--session` waits for the desktop and takes screenshots. Every boot also keeps up to eight screenshots from before the system is up (`boot-1.png` and on), where the boot splash shows.

### Modes

| Mode | Firmware | Started from | Notes |
| --- | --- | --- | --- |
| `uefi-usb` | UEFI | USB stick | Use with `--session` to check the desktop |
| `uefi-sb-cd` | UEFI with Secure Boot | DVD | |
| `uefi-cd` | UEFI | DVD | |
| `bios-cd` | BIOS | DVD | Not for arm64 |
| `bios-usb` | BIOS | USB stick | Not for arm64 |
| `install` | UEFI with Secure Boot | USB stick, with a blank disk | Installs unattended onto `--disk` (a qcow2 image) |
| `installed-uefi-sb` | UEFI with Secure Boot | the installed disk | Boots the disk `install` wrote |
| `installed-bios` | BIOS | the installed disk | Not for arm64 |
| `persist-1` | UEFI | a writable stick image | First of two boots for `persistence`; `--disk` is a raw copy of the ISO made bigger |
| `persist-2` | UEFI | the same stick image | Must find what `persist-1` saved |

An install test, as the GitHub build runs it for an Ubuntu-based ISO:

```bash
qemu-img create -f qcow2 build/disk.qcow2 64G
python scripts/boottest.py --iso build/testos.iso --mode install --disk build/disk.qcow2 --out build/results/modes/install
python scripts/boottest.py --iso build/testos.iso --mode installed-uefi-sb --disk build/disk.qcow2 --session --out build/results/modes/installed-uefi-sb
python scripts/boottest.py --iso build/testos.iso --mode installed-bios --disk build/disk.qcow2 --out build/results/modes/installed-bios
```

A Fedora-based ISO installs from a published image, which `install` takes with `--autoinstall-image <registry image>`. A persistence test, for a spec with `persistence: true`:

```bash
cp --sparse=always build/testos.iso build/stick.img
truncate -s 8G build/stick.img
python scripts/boottest.py --iso build/testos.iso --mode persist-1 --disk build/stick.img --session --out build/results/modes/persist-1
python scripts/boottest.py --iso build/testos.iso --mode persist-2 --disk build/stick.img --session --out build/results/modes/persist-2
```

### Options

| Option | Default | What it does |
| --- | --- | --- |
| `--accel` | `auto` | `kvm`, `tcg` (emulation) or `auto`, which uses KVM when `/dev/kvm` is usable |
| `--arch` | `amd64` | `arm64` boots an ARM ISO on QEMU's virt machine; needs `qemu-system-aarch64` and ARM UEFI firmware (Debian's `qemu-efi-aarch64`) |
| `--memory` | 4096 MiB | Guest memory; 8192 when emulated |
| `--cpus` | 2 | Guest CPUs; up to 4 of the host's when emulated |
| `--boot-timeout` | 480 s | Time for the system to come up, with KVM |
| `--session-timeout` | 600 s | Time from then to the desktop, with KVM |
| `--tcg-factor` | 5 | Timeouts are multiplied by this without KVM |
| `--screenshots` | 3 | Desktop screenshots with `--session`, `--screenshot-interval` (30 s) apart |

Then check the results against the spec, as the GitHub build does. `verify-results` reads two files the GitHub build writes into the results folder: `iso.json`, the inspect report, and `meta.json`, which must at least name the base (and, for an ARM ISO, `"arch": "arm64"`). Write them yourself:

```bash
python -m linuxlive inspect-iso build/testos.iso --json build/results/iso.json > /dev/null
echo '{"base": "ubuntu"}' > build/results/meta.json
python -m linuxlive verify-results --spec examples/testos-ubuntu.yaml --results build/results --check iso,boot,session
```

Leave out checks for tests you did not run. See [what the results artifact holds](/spec/github-actions/#what-the-results-artifact-holds) for the layout.

You can also boot the ISO in VirtualBox or from a USB stick: see [VirtualBox](/help/virtualbox/) and [USB stick](/help/usb-stick/).

## Building again

podman caches the build's steps, so a rebuild after a small change to the spec is faster. To start clean:

```bash
sudo podman rmi localhost/testos
sudo podman system prune --all
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `[assemble-iso] error: must run as root` | Run the assembler with `sudo`. |
| `iso.env not found; run 'python -m linuxlive compile' first` | The first argument must be the folder `compile` wrote. |
| `mksquashfs is not installed` (or another tool) | Install the packages from step 1. |
| `GRUB i386-pc files not found (install grub-pc-bin)` | Install `grub-pc-bin`. |
| The assembler cannot find the image | You built it without `sudo`, so it is in your own podman storage. Build it again with `sudo`. |
| "No space left on device" | Free space, use `LL_RMI_AFTER=1`, and run `sudo podman system prune --all`. Fedora needs the most room. |
| Installing Flatpaks fails | The assembler needs to reach Flathub. Check your connection, proxy or firewall, and run it again. |
| `none of these firmware files exist: ... (install ovmf)` | Install `ovmf` for the UEFI modes. |
| `sudo podman build` fails on a package | Run it again later: a mirror may be updating. A package named in your spec's `packages` must exist in that base's archive. |
