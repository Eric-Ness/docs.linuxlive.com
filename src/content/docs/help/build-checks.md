---
title: What a build checks
description: Every test a linuxlive build runs on your distro, what each check means, and where to read the results.
---

Every build, whichever way you start it, runs the same pipeline: it checks the spec, builds the system, makes the ISO, starts that ISO in virtual machines, and then compares what it saw with your spec. A build is green only when every check passes.

The checks are derived from your spec, never copied from the results. A build that boots the wrong name, Ubuntu's or Fedora's own boot splash, a failed system service, or a desktop without your wallpaper fails.

## 1. Checking the spec

The first step, **Check the spec**, runs `python -m linuxlive validate --online` on your `linuxlive.yaml` before anything is built. A bad spec stops here, with every problem listed at once.

The offline part checks, among other things:

- the spec matches the format (the JSON Schema in the linuxlive repository);
- an id can be made from the name, and the desktop exists on the base;
- every app in `apps` is in the catalog, and none of the `flathub` apps is a catalog app under its Flathub ID;
- the wallpaper is a PNG or JPEG of at least 1280 by 720, and the logo a square PNG of 128, 256 or 512 pixels;
- the boot splash, files and scripts are inside the spec's folder and within their limits;
- the language, keyboard and time zone are known, the dock and the kiosk app name apps the distro has, and Firefox's home page and bookmarks come with Firefox;
- `persistence` is only on an Ubuntu base, and every catalog app exists for each CPU in `arches`.

`--online` then asks Flathub's API about each app in `flathub`, for every CPU the spec builds for. Each must exist on Flathub, be an app (not a runtime), and be built for that CPU. Flathub's verified mark is shown in the log but not required. An app built on a runtime that gets no more updates gives a warning, not a failure: Flathub may list it under a new ID.

The spec reference lists every field: [Spec reference](/spec/reference/).

## 2. The five boot tests

The ISO is started in QEMU, a virtual machine, five ways. Every linuxlive system carries a small service, `linuxlive-bootcheck`, that reports what it finds to the virtual machine's serial port. It only runs when the test asks for it, so it does nothing on a real computer.

| Boot | What it is | The build page calls it |
| --- | --- | --- |
| `uefi-usb` | A modern PC starting from a USB stick. This one waits for the desktop and takes screenshots. | UEFI from USB, to the desktop |
| `uefi-sb-cd` | A modern PC with Secure Boot on, starting from a DVD | UEFI with Secure Boot, from CD |
| `uefi-cd` | A modern PC starting from a DVD | UEFI from CD |
| `bios-cd` | An older PC (BIOS) starting from a DVD | BIOS from CD |
| `bios-usb` | An older PC (BIOS) starting from a USB stick | BIOS from USB |

`uefi-usb` runs first. If it never reaches the running system, the other four are skipped, rather than spending hours timing out, and the log says:

```
The first boot never reached userspace; skipped the other boot modes
```

### The desktop boot

On `uefi-usb` the test waits for the desktop session, waits a further 45 seconds for it to settle, then takes three screenshots 30 seconds apart. It also keeps up to eight pictures from before the desktop, one every 4 seconds, so the boot splash can be seen. Blank screens are not kept.

If a boot does not get where it should, the test keeps a picture of where it got stuck (`stuck.png`).

### How long a boot may take

| Stage | Time allowed |
| --- | --- |
| From power-on until the boot check starts | 8 minutes |
| From the boot check to the desktop | 10 minutes |
| From the boot check to its first report (the other boots) | 5 minutes |
| The install test, from start to finish | 30 minutes |

Without KVM (hardware virtualisation) every one of these is five times longer, because the processor is emulated. That is always the case for ARM builds.

## 3. The persistence test

Only for a spec with `persistence: true` (Ubuntu only). The build copies the ISO onto an 8 GB stick image, so there is free space after it, and starts it twice from that stick:

- **First start** (`persist-1`): the live desktop comes up from the default boot entry, which saves changes. Casper, Ubuntu's live system, makes its `writable` partition on the stick. Nothing has been saved yet.
- **Second start** (`persist-2`): the system must find what the first start wrote, both a file of the system's and one in the user's home folder, and it must be a new start, not the first one again.

The build page shows these as **Saved files on the USB stick** and **Found them again after a restart**.

## 4. The install test

The build installs the distro, unattended, onto a blank 64 GB virtual disk, then starts that disk on its own:

- **install**: the ISO boots from USB under UEFI with Secure Boot, with the blank disk attached, and installs onto it as the user `tester`.
- **installed-uefi-sb**: the installed disk starts alone, under UEFI with Secure Boot, to the desktop.
- **installed-bios**: the installed disk starts alone under BIOS (not on ARM, which has no BIOS).

Fedora-based distros install from the system image the build publishes to GitHub's package registry, so the install test runs only when the build publishes it (`publish-image: true`, which the template sets). Otherwise the summary says `No image published (publish-image is off); skipped the install test`. See [Installing](/help/installing/).

If the spec asks for automatic login, the test install keeps the spec's setting, so the installed disk reaching the desktop proves it.

## 5. ARM builds

A spec with `arm64` in `arches` gets a second ISO and a second job, `build arm64`, on GitHub's ARM machines. Those have no KVM, so every boot is emulated and slow, with the longer time limits above.

ARM has no BIOS, so an ARM build runs three boots: `uefi-usb`, `uefi-sb-cd` and `uefi-cd`. The install test runs the install and the Secure Boot start of the installed disk, but not the BIOS one. Everything else is checked as on a PC.

## 6. Every check the verifier makes

The **Verify** step runs `python -m linuxlive verify-results`. It prints one `PASS` or `FAIL` line per check, then either `VERIFY OK` or `VERIFY FAILED: <n> of <m> checks failed`. Each line starts with the group it belongs to.

### meta: the right build

| Check | What it means |
| --- | --- |
| Base | The results are for the base the spec names. |
| Commit | The results come from the commit being built, not an older run. |

### iso: the ISO itself

| Check | What it means |
| --- | --- |
| Volume ID | The ISO's volume label is the one made from your spec. |
| BIOS boot entry, MBR | On PC ISOs, the DVD boot catalog has a BIOS entry and the USB boot record is there. ARM ISOs must have no BIOS entry. |
| EFI boot entry, GPT | The DVD boot catalog has a UEFI entry, and there is a partition table with an EFI system partition for USB sticks. |
| Boot files | The Secure Boot shim, GRUB, the MOK manager, the kernel, the initramfs and the compressed system are all there and not suspiciously small. |
| `md5sum.txt` | Ubuntu only: the checksum list Ubuntu's own medium check reads is there, lists every file but two that cannot be listed, and matches them. |

### boot: each of the boots

For each boot mode:

| Check | What it means |
| --- | --- |
| Reached the system | The boot got as far as the running system. |
| Firmware | The system reports BIOS or UEFI, as the mode should. |
| Secure Boot | The system reports Secure Boot on in `uefi-sb-cd` and off in every other mode. |
| OS name | The system's name (`NAME` in os-release) is your distro's name. |

### session: the live desktop

These come from the `uefi-usb` boot.

**Name and version**

| Check | What it means |
| --- | --- |
| Desktop came up | The desktop session started. |
| `PRETTY_NAME` | The full name starts with your name and version, then "(based on". |
| `IMAGE_ID`, `IMAGE_VERSION` | They are your spec's `id` and `version`. |
| `BUILD_ID` | It is this build's own number (the date and the run number), so a monthly rebuild of one version can be told apart. |

**The desktop**

| Check | What it means |
| --- | --- |
| Desktop shell | The program that draws the desktop is your desktop's (GNOME Shell, Plasma or Cinnamon). In kiosk mode it is Cage, running as the user `linuxlive-kiosk`. |
| Installer on the desktop | The live desktop shows the installer's icon (not in kiosk mode). On Ubuntu with GNOME, the icon is trusted, so a double-click starts it, and the desktop icons themselves are drawn. |
| Installer can see disks | The installer's window can list the disks as the live user. |
| No welcome wizard | Ubuntu's or Fedora's own first-login wizard does not open. |
| Shell after 30 seconds | The desktop shell is still running 30 seconds after login. |
| Shell until the end | It kept running until the test finished, after the screenshots. If it crashed, the line says how long after login. |

**Boot splash**

| Check | What it means |
| --- | --- |
| Plymouth theme | The boot splash is linuxlive's (`linuxlive`), not the base's. |
| In the initramfs | The splash is packed where the first stage of the boot can load it. |
| Your own splash | With `branding.splash`: the theme uses Plymouth's script module, and the initramfs carries your script, every image, the logo (`watermark.png`) and the script plugin. |
| Text splash | Ubuntu only: the text-mode splash is `linuxlive-text`, and Ubuntu's own is not packed. |

**Apps**

| Check | What it means |
| --- | --- |
| Installed | Every Flatpak app from `apps` and `flathub` is installed. |
| Starts | Every Flatpak app starts as the session's user, so its sandbox works. Kiosk mode checks its own app instead. |

**Your extras**

| Check | What it means |
| --- | --- |
| Packages | Each package in `packages` is installed. |
| Files | Each file in `files` is at its `dest`, with exactly the spec's content. |
| Repos | Each GitHub repository was built in at its commit. |
| Build scripts | Each build script ran. |
| First-login scripts | Each first-login script ran and exited with success. |

First-boot scripts only run on an installed system, so they are checked by the install test.

**Settings**

| Check | What it means |
| --- | --- |
| Computer name | The hostname is `settings.hostname`, or the id. |
| Language | The system locale and the session run in your language, and the desktop shell has its translation. |
| Time zone | The system's time zone is yours (UTC under any of its other names counts). |
| Keyboard | Both the system and the session type with your layout. |
| Hidden menu entries | Each entry in `hidden_apps` is hidden or not there. |
| Dock | The logged-in user's dock or panel pins exactly your `dock` list, in order. |
| Firefox | Firefox's system policies are the ones made from your home page and bookmarks. |
| Kiosk | No desktop shell runs, your kiosk app does, and a Firefox kiosk opened your home page and has your bookmarks. |

See [Settings](/workshop/settings/) and [The dock](/spec/dock/).

**Ubuntu's and Fedora's own branding**

| Check | What it means |
| --- | --- |
| Fedora's logos | Fedora's logo packages are not installed. |
| `/etc/issue` | Ubuntu only: the login text starts with your name and version. |
| Show Apps icon | Ubuntu with GNOME: the dock shows GNOME's grid, not the Ubuntu logo. |
| KDE launcher | KDE: the application launcher shows your logo. |
| SELinux | Fedora only: SELinux is enforcing. |

**A clean live session**

| Check | What it means |
| --- | --- |
| No failed services | No system service has failed, at login or 30 seconds later. The line includes the failed service's log. |
| No update notifiers | Nothing in the live session nags about updates. |
| GNOME Software | It does not check for updates (or is not installed). |
| Plasma Welcome | KDE: if its welcome window offers an installer, that installer exists. |
| Medium check | Ubuntu only: casper's check of the ISO against `md5sum.txt` passed, or was still running when the test ended. |

**Your wallpaper on screen**

The verifier finds your wallpaper's colour in the screenshots:

- For a colourful wallpaper, it finds the wallpaper's main hue. Pixels within 18 degrees of that hue must cover at least 25% of the best screenshot.
- For a pale or grey wallpaper (its own main hue covers less than 40% of it), it uses the wallpaper's main colours instead. They must cover at least 50% of the best screenshot, and the desktop must not be blank.

The line shows what it measured on each screenshot, for example `wallpaper hue 24 deg covers 61% of the best screenshot (needs 25%; measured screenshot-1.png=0.58, ...)`.

This check needs the wallpaper as an 8-bit, non-interlaced PNG. A JPEG builds and boots but fails here. See [Why a build fails](/help/failed-builds/).

In kiosk mode there is no wallpaper on screen, so the check is instead that the kiosk's screen is not blank: under 97% one colour, and at least 24 colours.

### install: the installed system

Fedora builds that published no image have nothing to check here.

| Check | What it means |
| --- | --- |
| Install finished | The unattended install completed. If not, the line gives the installer's error. |
| Boots to the desktop | The installed disk starts to the desktop under UEFI with Secure Boot, from the disk and not the ISO. |
| Secure Boot | It reports Secure Boot on. |
| File system | Ubuntu: the root is ext4. Fedora: a composefs root on xfs. |
| Updates | Fedora: it is a bootc system that updates from the image the build published. Ubuntu: casper, the live system, is removed. |
| User | The only login user is `tester`, and the session runs as `tester` (or `linuxlive-kiosk` in kiosk mode). |
| Automatic login | With `autologin: true`, the login screen logs `tester` in. |
| Name | os-release `NAME` is your distro's name. |
| No wizard, no installer | No first-login wizard opens, and the installed desktop has no installer icon. |
| Apps | The same Flatpak apps as the live session are installed, and each starts. |
| Extras and settings | Every extra and setting above, checked again on the installed disk, plus each first-boot script ran and succeeded. |
| BIOS | On PCs: the installed disk also starts under BIOS, from the disk. |

### persistence: saving to the stick

Only with `persistence: true`.

| Check | What it means |
| --- | --- |
| Desktop from the stick | Both starts reach the live desktop. |
| Saving entry | The default boot entry is the one that saves changes. |
| Writable partition | Casper's `writable` partition is on the stick. |
| Empty at first | The first start finds nothing saved yet. |
| System kept | The second start finds what the first wrote to the system. |
| Home kept | The second start finds what the first wrote to the user's files. |
| A real second start | The second start is a new boot, not the first one again. |

## Where to see the results

### A build in your GitHub

Open the run on your repository's **Actions** tab.

- **The run's summary** says `Built, booted and verified` with the last verifier line, or `The build or a check failed. Open the failed step above for the reason.` Under **Every check** it lists every `PASS` and `FAIL` line.
- **The failed step**: click it to read the log. A check that failed shows as a `FAIL` line in **Verify**.
- **`results-<name>`** under Artifacts, kept 14 days, holds everything the checks read:

| File | What it is |
| --- | --- |
| `meta.json` | The commit, the build number, the base, the CPU, and the linuxlive version used |
| `iso.json` | The report on the ISO's boot structures and files |
| `modes/<mode>/result.json` | One boot: how it ended, how long each stage took, and every fact the system reported |
| `modes/<mode>/serial.log` | Everything the system printed to the serial port |
| `modes/<mode>/qemu.log` | The virtual machine's own output |
| `modes/uefi-usb/screenshot-*.png` | The desktop, three times |
| `modes/<mode>/boot-*.png` | The screen during the boot, the splash among them |
| `modes/<mode>/stuck.png` | Where a boot got stuck, if it did |

The screenshots in `modes/uefi-usb/` are the quickest way to see your distro without booting it. In `result.json`, `outcome` is `session` (desktop reached), `booted` (system reached), `installed`, `install-failed`, `timeout`, `qemu-exited` or `qemu-error`.



You can re-run the verifier on your own computer against a downloaded `results-<name>` folder; see [Building locally](/spec/building-locally/).

### Build it for me

The build page shows the progress step by step, then a **Boot-tested** card that ticks or crosses each boot, the install and persistence tests included, and the desktop as the test saw it. A failed build marks the step where it stopped in red, with the reason. Builds on linuxlive.com's own server have a **Read the build log** link; builds run on GitHub have **Watch every line on GitHub**. See [The build page](/distros/build-page/).
