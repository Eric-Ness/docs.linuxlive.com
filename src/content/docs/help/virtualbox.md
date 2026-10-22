---
title: Booting in VirtualBox
description: How to try a linuxlive ISO in a VirtualBox virtual machine, with notes on QEMU, GNOME Boxes and Apple-silicon Macs.
---

A virtual machine runs the ISO in a window, so you can look around without a USB stick or a restart. [VirtualBox](https://www.virtualbox.org/) works on Windows, Linux and Macs with an Intel chip. The steps below are for VirtualBox 7.

:::note
linuxlive's own tests boot every ISO in QEMU, not VirtualBox. Only the TestOS Ubuntu example has been tried in VirtualBox. If something here does not match what you see, tell us at github.com/Eric-Ness/linuxlive/issues.
:::

## Create the machine

1. Click **New**. Give the machine a name, and for **ISO Image** choose your ISO.
2. If VirtualBox offers an unattended installation, tick **Skip Unattended Installation**. The ISO is a live system: there is nothing for VirtualBox to install.
3. Set **Type** to Linux and **Version** to *Ubuntu (64-bit)* or *Fedora (64-bit)*, to match your distro's base.
4. **Hardware**: give it at least 4096 MB of memory and 2 CPUs.
5. **EFI**: tick **Enable EFI** so it starts like a modern PC. Leave it off to start it like an older BIOS PC instead. Both work.
6. **Hard disk**: to only look around, choose **Do Not Add a Virtual Hard Disk** and confirm the warning. To try the installer as well, add a virtual disk instead: 20 GB for most distros, 32 GB for large ones such as a GIS workstation. If it is too small, the installer says how much it needs.
7. Finish. Then, under **Settings** > **Display**, check that the graphics controller is **VMSVGA**, and give it 128 MB of video memory.
8. Click **Start**.



Choosing the ISO in step 1 attaches it as the machine's optical drive, which is what the machine starts from.

## What you see

- **The boot menu**, which starts its first entry by itself after 5 seconds:

  | Entry | When to use it |
  | --- | --- |
  | **Try *name version*** | Normally. With persistence it reads "saving your changes on the USB stick". |
  | **Try *name version* without saving anything** | Only on distros with persistence. |
  | **Install *name version*** | Starts the live system straight into the installer. See [Installing](/help/installing/). |
  | **Try *name version* (safe graphics)** | The screen stays black, or is garbled, after the splash. |
  | **UEFI firmware settings** | Opens the virtual machine's firmware setup. Only with EFI on. |

- **The boot splash** with your logo. Where early graphics are not available, a text screen with your distro's name shows instead. That is normal.
- **Your desktop** with your wallpaper, logged in automatically: as `live` on Ubuntu, `liveuser` on Fedora, with no password. A kiosk distro shows its app instead.

If the screen is small, change the resolution in the desktop's display settings. VirtualBox's Guest Additions are not included, so resizing the window does not resize the desktop.

## Secure Boot

linuxlive tests Secure Boot in QEMU with Microsoft's keys loaded, which is how most PCs ship. VirtualBox 7 can also turn on Secure Boot for a machine with EFI, but linuxlive's ISOs have not been tested that way in VirtualBox, and these docs have no settings to give for it. Leaving Secure Boot off in VirtualBox is fine for trying a distro. See [Secure Boot](/help/secure-boot/).

## Persistence cannot be tested here

A distro with persistence saves changes in a partition it makes on the USB stick, in the free space after the ISO. A virtual machine that starts from the ISO file as a DVD has no such stick to write to, so every start is fresh. To try persistence, write the ISO to a USB stick: see [USB stick](/help/usb-stick/).

## Macs with Apple silicon

Macs with an M1 chip or later cannot run the usual PC ISO, which is built for Intel and AMD processors. A distro built with **Also build for ARM (Apple-silicon Macs)** has a second ISO, ending in `-arm64.iso`, made for virtual machines on those Macs: UTM, Parallels or VMware Fusion. It starts through UEFI only.

:::caution
The ARM ISO is boot-tested in emulated QEMU, not on a real Mac. Nobody has yet tried it on Apple-silicon hardware, and these docs have no step-by-step settings for UTM, Parallels or VMware Fusion.
:::

## QEMU

On Linux, QEMU can start the ISO in a window. With KVM, 4 GB of memory and 2 CPUs, from the DVD drive under BIOS:

```bash
qemu-system-x86_64 -enable-kvm -m 4096 -smp 2 -cdrom mydistro.iso
```

For UEFI, give QEMU the OVMF firmware and its own copy of the firmware's settings store:

```bash
cp /usr/share/OVMF/OVMF_VARS_4M.fd vars.fd
qemu-system-x86_64 -enable-kvm -machine q35 -m 4096 -smp 2 \
  -drive if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE_4M.fd \
  -drive if=pflash,format=raw,file=vars.fd \
  -cdrom mydistro.iso
```

Those firmware paths are Ubuntu 24.04's; other Linux distributions often keep OVMF in `/usr/share/edk2/ovmf/`. To run the same automated boot tests CI runs, see [Building locally](/spec/building-locally/).

## GNOME Boxes

On Linux, GNOME Boxes is simpler still: create a new machine from the ISO file. These docs have no tested settings for it; give it the same 4 GB of memory and 2 processors as above if it asks.
