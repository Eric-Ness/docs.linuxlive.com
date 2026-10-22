---
title: Installing a distro
description: How the linuxlive installer puts your distro on a computer's disk, what it asks, and what happens after.
---

Every linuxlive distro can install itself, so the computer starts it from its own disk, faster, with your files kept between starts.

:::danger
The installer erases one whole disk. Everything on the disk you pick is lost, Windows or another Linux included. Installing next to another system (dual boot) is not offered: use a spare computer, a second disk, or a virtual machine.
:::

## Starting the installer

Start the distro from its USB stick (see [USB stick](/help/usb-stick/)), then either:

- open **Install *name*** on the live desktop (it is in the app menu too), or
- pick **Install *name version*** in the boot menu. The live system starts and the installer opens by itself.

**Kiosk distros** show their app full screen, with no desktop to click on. Use the boot menu's **Install** entry: it starts the desktop instead of the kiosk, so the installer works.



## What it asks

The window says at the top: "The disk you pick is erased completely: every file and system on it is lost." Fill in:

| Field | Notes |
| --- | --- |
| **Disk to erase** | A whole disk. Disks it cannot use are listed with the reason, such as "the live system is running from it", "something on it is in use (mounted)" or "too small: needs 20 GB". |
| **Your name** | Your full name. It may not contain a colon or a line break. |
| **User name** | Filled in from your name. Lower case: it must start with a letter and use only a-z, 0-9, - and _. |
| **Password**, **Password again** | Both the same. |
| **Computer name** | Starts as the distro's computer name (`settings.hostname`, or its id). Letters, digits and dashes. |
| **Time zone** | Starts as the live system's, which is the spec's time zone if it has one. Pick from the list. |
| **Log in automatically** | Ticked if the distro was built with automatic login (`autologin` in [Settings](/workshop/settings/)). Untick it to get a login screen. |

Then press **Erase disk and install**. A box asks "Erase /dev/sdX?" and says "Everything on /dev/sdX will be lost. Type erase to go on." Type `erase` and press OK. Anything else, or Cancel, leaves the disk alone, and the window says "Nothing was changed."

A progress bar follows. When it finishes: "*name* is installed. Restart, remove the USB stick when the screen goes dark, and the computer starts from its disk." Press **Restart now**.

### Disk size

- **Fedora-based**: the disk must be at least 20 GB.
- **Ubuntu-based**: the disk must hold the system plus 4 GiB to spare. The installer works it out and shows the size it needs next to a disk that is too small.

In a virtual machine with no disk at all, the installer says: "no disks were found; in a virtual machine, add a disk of 20 GB or more and restart". A large distro, such as a GIS workstation, may need 32 GB.

## Fedora-based distros need the internet

A Fedora-based distro does not install from the USB stick. It downloads its system, about 3 GB, from the image its build published to GitHub's package registry. So:

- **Connect to a network first**, on the network icon in the panel. Without one the installer stops with "no internet connection: installing *name* downloads it (about 3 GB). Connect to a network and try again". It waits up to 90 seconds for a network that is still coming up.
- **The build must have published its image.** A build in your GitHub from the template does (`publish-image: true`). Without it the installer says this build "was not published to a registry, so it cannot be installed (build it with GitHub Actions from the linuxlive template)".
- **Build it for me** makes Fedora-based builds live only: linuxlive.com cannot make them installable yet. The build page says so. To install one, build it in your GitHub.

Ubuntu-based distros install from the stick and need no internet.

## What the installer does

- **Ubuntu-based**: the disk gets a GPT partition table with a BIOS boot partition, an EFI system partition and an ext4 root. The installer copies the live system across, removes the live-only parts, and installs GRUB for UEFI (through Ubuntu's signed shim, so Secure Boot works) and for BIOS.
- **Fedora-based**: bootc lays out the disk (BIOS boot, EFI and an xfs root) and installs the image, with GRUB through Fedora's signed shim for UEFI with Secure Boot and for BIOS. The live session's Flatpak apps are copied over, and on the first start a service creates your user before the login screen appears.

Either way, the installed system starts with or without Secure Boot, on UEFI and on older BIOS computers. It has your apps, extras and settings, and no installer icon. No Ubuntu or Fedora welcome wizard opens at first login. Every build tests all this in a virtual machine: see [What a build checks](/help/build-checks/#4-the-install-test).

## After installing

### Updates on Fedora

A Fedora-based install follows the image its build published (tagged `:latest`, which moves only when a build passes every check). It updates as a whole with:

```bash
sudo bootc upgrade
```

So when you rebuild your distro, every installed computer can take the new build. See [Rebuilds and updates](/distros/rebuilds-and-updates/).

### Updates on Ubuntu

An Ubuntu-based install keeps Ubuntu's own identity for its package tools (`ID` and `VERSION_ID` in os-release stay Ubuntu's), so it updates with Ubuntu's usual tools:

```bash
sudo apt update && sudo apt upgrade
```

## If the install does not finish

Before anything is erased, the window checks what you typed and says what to fix in red, for example "The two passwords differ.", "The user name must start with a lowercase letter and use only a-z, 0-9, - and _." or "Pick a time zone from the list."

If the install stops partway, the window shows "The install did not finish." and the reason, for example "the user name *name* is taken by the system" (root, live, liveuser and a few other system names are) or, on Fedora, the missing internet connection. Fix it and start the installer again.
