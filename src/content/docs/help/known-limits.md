---
title: Known limits
description: What linuxlive cannot do yet, what has not been tested, and the known problems, as of linuxlive 0.9.1.
---

linuxlive is young. Everything below is known; there is no need to report it again, though an issue with new details is always welcome at github.com/Eric-Ness/linuxlive/issues.

## Installing

| Limit | What it means for you |
| --- | --- |
| **The installer erases a whole disk** | **Install** puts your distro on one disk and erases everything on it. No dual boot, no choice of partitions, no disk encryption. See [Installing](/help/installing/). |
| **Fedora-based installs need the internet** | They download the system image the build published (about 3 GB). A build that did not publish its image cannot install. Ubuntu-based distros install offline. |
| **Build it for me makes Fedora live only** | Fedora-based builds from linuxlive.com's own builder have no installable image. Build in your GitHub to install one. |
| **The installer is tested in QEMU only** | Every build installs the distro in a virtual machine and starts the installed disk. It has not been tested on real hardware. |
| **The Install label is not translated** | The **Install *name*** launcher is in English, whatever language the distro is set to. |

## The live system

| Limit | What it means for you |
| --- | --- |
| **Persistence is Ubuntu-only** | Fedora's live boot keeps changes only on a partition that something has made on the stick beforehand, and nothing does that for a written ISO. Fedora-based distros forget everything at shutdown. |
| **Persistence needs a real stick** | A virtual machine starting from the ISO file has nowhere to save. See [Booting in VirtualBox](/help/virtualbox/). |
| **No kernel choice** | Each base brings its own kernel, and hardware support is what that kernel provides. |
| **Cinnamon has no accent colour** | Its theme fixes the colours. |
| **Big ISOs** | About 3 GB on Ubuntu and 4.5 GB on Fedora. The TestOS Fedora example (4.45 GiB) does not fit on a single-layer DVD (4.7 GB): use a USB stick. |
| **A large initramfs on Fedora** | About 265 MB, because one image serves both live and installed starts. Boots take a little longer to load. |

## ARM

| Limit | What it means for you |
| --- | --- |
| **For virtual machines only** | The ARM ISO is for UTM, Parallels or VMware Fusion on Apple-silicon Macs. Macs with Apple silicon cannot start any linuxlive ISO from a USB stick. |
| **No real Mac test** | ARM ISOs are boot-tested in emulated QEMU. None has been tried on an Apple-silicon Mac yet. |
| **UEFI only, and slow to build** | ARM has no BIOS. Its boot tests run emulated, so an ARM build takes much longer than a PC one. |
| **Apps must exist for ARM** | Every app must be built for ARM64 on Flathub. The Workshop and the spec check say which are not. |

## What has not been tested

| Where | Status |
| --- | --- |
| **Real hardware** | Every build boots in QEMU. No linuxlive ISO has been tested on real hardware yet. Reports are very welcome. |
| **Secure Boot on real PCs** | It works with Secure Boot firmware in QEMU, using each base's signed boot chain. See [Secure Boot](/help/secure-boot/). |
| **VirtualBox** | Only the TestOS Ubuntu example has been tried in VirtualBox. |
| **GNOME on Fedora, KDE on Ubuntu** | These compile and are covered by linuxlive's unit tests, but CI does not build or boot them. CI boots GNOME on Ubuntu, KDE on Fedora, and Cinnamon on both. |
| **Ventoy and other writers that unpack the ISO** | linuxlive's USB tests write the image byte for byte. See [USB stick](/help/usb-stick/). |

## Known problems

| Problem | Affects | Harm |
| --- | --- | --- |
| An occasional SELinux denial early in the boot: systemd reading a socket opened before the security policy loaded. It appeared in 3 of 7 green Fedora KDE runs up to 2026-10-11, and in one boot of six kept Fedora Cinnamon runs. | Fedora | None seen. It looks like a harmless race, but that is not confirmed. The build does not fail on it. |
| `plymouth-start.service` was reported failed once, and not in the runs since. The cause is not known. | Fedora Cinnamon | None seen. A build now fails if it comes back. |
| On Ubuntu with GNOME, nothing accent-coloured is on screen in the test screenshots. | Ubuntu, GNOME | The accent colour is only checked in the built configuration, not on screen. |
| downloads.linuxlive.com now and then ignores a request to resume a download (about one request in five) and sends the whole ISO again. | Library and Build it for me downloads | Downloads work, but a resumed download may start over. |
| The boot splash shows as a text screen with the distro's name where early graphics are not available, or with **safe graphics**. | Some computers and virtual machines | Cosmetic. |

## Keeping builds

| Limit | What it means for you |
| --- | --- |
| **Build it for me downloads last 30 days** | Then they are deleted. To keep a distro, build it in your GitHub. |
| **GitHub keeps an ISO 7 days by default** | Set `iso-retention-days` to change it, or save the ISO somewhere of your own. Test results are kept 14 days. See [GitHub Actions](/spec/github-actions/). |
| **Build it for me builds no code** | Distros with scripts or GitHub repos of their own are built only in your GitHub. |
| **The Workshop holds one script of each kind** | A spec with more is edited by hand. Through the Workshop a distro can carry at most 16 files of its own. |
