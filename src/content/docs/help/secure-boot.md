---
title: Secure Boot
description: Why linuxlive ISOs start with Secure Boot on, what to do if a computer refuses, and what that means for extra kernel modules and ARM.
---

Leave Secure Boot on. Every linuxlive ISO starts with it on.

## Why it works

Secure Boot lets a computer start only software signed with a key it trusts. Most PCs trust Microsoft's keys, and Ubuntu and Fedora each ship a small first-stage loader, called shim, signed with them. Shim then checks GRUB, the boot menu, and GRUB checks the kernel, each signed by Ubuntu or Fedora.

A linuxlive ISO uses exactly that chain from its base. When the ISO is made, it takes the base's own signed shim, GRUB and MOK manager from the built system and puts them on the ISO, and the kernel is the base's own. linuxlive does not re-sign any of them. On a PC the ISO starts with `EFI/BOOT/BOOTX64.EFI`, which is the shim.

Every build checks this: one of the five boot tests, `uefi-sb-cd`, starts the ISO with Secure Boot firmware that has Microsoft's keys loaded, and the verifier fails unless the system reports Secure Boot on. The install test also starts the installed disk with Secure Boot on. See [What a build checks](/help/build-checks/).

Installed systems keep the same chain: the installer sets up GRUB through the base's signed shim, so the installed disk starts with or without Secure Boot, on UEFI and on older BIOS computers.

## If a computer refuses to start the stick

Secure Boot has been tested with Secure Boot firmware in QEMU, not yet on real PCs. If a PC will not start the stick:

1. Check the download's SHA-256 and write the stick again: see [USB stick](/help/usb-stick/). A broken download is the most common reason an ISO will not start.
2. In the computer's boot menu, pick the entry for the stick with **UEFI** in its name.
3. If it still refuses, turning Secure Boot off in the firmware setup is a workaround. The boot menu's **UEFI firmware settings** entry, or the maker's setup key, gets you there.
4. Report it at github.com/Eric-Ness/linuxlive/issues: the computer's make and model, BIOS or UEFI, Secure Boot on or off, and what you saw. A phone photo of the screen helps.

## Extra kernel modules

linuxlive adds no drivers of its own; hardware support is what the base's kernel provides. Kernel modules that come with the base's kernel are signed by Ubuntu or Fedora along with it.

A module from anywhere else, for example one a build script or a GitHub repo in your [extras](/workshop/extras/) compiles, is not signed by the base. With Secure Boot on, a kernel that enforces signatures will not load it. linuxlive does not sign modules and does not test this case.

:::caution
If your distro depends on such a module, test it on a computer with Secure Boot on before you share it.
:::

## ARM

ARM ISOs, for virtual machines on Apple-silicon Macs, use the same arrangement with the base's ARM shim and GRUB (`EFI/BOOT/BOOTAA64.EFI`). Their Secure Boot test runs with ARM UEFI firmware that has Microsoft's keys, emulated, and it checks the same things as on a PC. Whether Secure Boot is on in UTM, Parallels or VMware Fusion depends on how that virtual machine is set up; these docs have no settings for it.
