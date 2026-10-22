---
title: Writing a USB stick
description: Check the ISO's SHA-256, write it to a USB stick on Windows, macOS or Linux, and start a computer from it.
---

You need the ISO and a USB stick of **8 GB or more**. Ubuntu-based ISOs are about 3 GB and Fedora-based ones about 4.5 GB.

:::danger
Writing the ISO erases everything on the stick. Copy off anything you need first.
:::

## 1. Check the download

Make sure the file arrived whole before you write it. A broken download is the most common reason an ISO will not start.

Open a terminal in the folder with the download and run the command for your system:

| System | Command |
| --- | --- |
| Windows (PowerShell) | `Get-FileHash .\mydistro.iso -Algorithm SHA256` |
| macOS (Terminal) | `shasum -a 256 mydistro.iso` |
| Linux | `sha256sum mydistro.iso` |

The long string it prints must match the SHA-256 checksum, character for character. Upper or lower case does not matter. Where to find the checksum:

- **A Library distro**: on its page.
- **Build it for me**: on the build page, under **SHA-256**, with a **Copy** button.
- **A build in your GitHub**: the `iso-<name>` artifact is a zip with `<name>.iso.sha256` beside the ISO. Unzip both into one folder. On macOS and Linux you can let the tool compare for you:

  ```bash
  shasum -a 256 -c mydistro.iso.sha256    # macOS
  sha256sum -c mydistro.iso.sha256        # Linux
  ```

  A good result is `mydistro.iso: OK`. On Windows, open the `.sha256` file in Notepad and compare its long number with the `Hash` PowerShell prints.

If the checksum does not match, download the ISO again.

## 2. Write it to the stick

linuxlive's USB boot tests start the ISO exactly as it is, byte for byte, which is what these tools write:

| System | Tool | How |
| --- | --- | --- |
| Windows | [Rufus](https://rufus.ie/) | Pick the stick and the ISO, then **Start**. When Rufus says it found an ISOHybrid image, choose **Write in DD Image mode**. |
| Windows, macOS, Linux | [balenaEtcher](https://etcher.balena.io/) | **Flash from file**, pick the stick, **Flash**. |
| Windows, macOS, Linux | [Fedora Media Writer](https://github.com/FedoraQt/MediaWriter) | Choose **Select .iso file**, pick the ISO and the stick, then **Write**. |
| Linux | GNOME Disks | Select the stick, open the menu, **Restore Disk Image**, pick the ISO. |
| Linux | `dd` | See below. |



### With dd on Linux

Find the stick's device name with `lsblk`, then:

```bash
sudo dd if=mydistro.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

Replace `sdX` with the stick. **Picking the wrong disk erases it.**

### Ventoy

[Ventoy](https://www.ventoy.net/) lets you keep several ISOs on one stick: install Ventoy on the stick once, then copy ISOs onto it like ordinary files. It works differently from the tools above, which write the image byte for byte, and linuxlive's tests do not cover it. If an ISO will not start from Ventoy, write it with one of the tools above instead.

## 3. Start the computer from the stick

1. Plug the stick in and restart the computer.
2. Press the boot menu key as soon as the screen lights up, and pick the USB stick. If it is listed twice, pick the entry with **UEFI** in its name.
3. The distro's boot menu appears. Press Enter, or wait 5 seconds.

Leave Secure Boot on: see [Secure Boot](/help/secure-boot/).

### Boot menu keys

| Who made the computer | Key | How |
| --- | --- | --- |
| Dell | F12 | Restart and tap F12 as soon as the Dell logo appears. F2 opens the firmware setup if you need it. |
| HP | Esc, then F9 | Restart and tap Esc to open the startup menu, then press F9 for the boot list. On many HP models F9 alone opens the boot list. F10 opens the firmware setup. |
| Lenovo | F12 | Restart and tap F12. On some laptops hold Fn while you do. IdeaPad and Yoga laptops may have a small Novo button with a curved arrow: press it with the laptop off and choose Boot Menu. |
| Acer | F12 | Restart and tap F12 at the Acer logo. If nothing happens, press F2 at start-up and turn on "F12 Boot Menu" in the firmware setup first. |
| ASUS | Esc | Laptops: restart and tap Esc. Desktop boards: tap F8. F2 or Del opens the firmware setup. |
| MSI | F11 | Restart and tap F11 at the MSI logo. Del opens the firmware setup. |
| Gigabyte | F12 | Restart and tap F12 at the Gigabyte logo. Del opens the firmware setup. |
| Microsoft Surface | Volume down, Power | Shut down. Hold the volume-down button, press and release power, and keep holding volume-down until the Surface logo goes away. It then starts from the USB stick. |
| Mac with Intel | Option | Restart and hold Option until the startup disks appear, then pick the one marked EFI Boot. Macs with a T2 chip need "Allow booting from external media" turned on in Startup Security Utility first. |
| Mac with Apple silicon | None | The PC ISO cannot start on Apple silicon (M1 and later): it is built for Intel and AMD processors. See [Booting in VirtualBox](/help/virtualbox/#macs-with-apple-silicon) for the ARM ISO, which is for virtual machines. |
| Something else | F12, F11, Esc | Restart and try these keys one at a time, right after power-on. Many computers show the right key on screen for a moment. F10, F8 and F9 are also common. If you only reach the firmware setup, look for a Boot tab and move USB to the top. |

## Keep your changes on a bigger stick

A plain live stick forgets everything at shutdown. A distro built with persistence (Ubuntu-based only) can keep your files, settings and added apps on the stick instead:

- The boot menu's first entry, **Try *name version*, saving your changes on the USB stick**, saves. The first time, it makes a partition labelled `writable` in the free space after the ISO, and finds it again on every start.
- **Try *name version* without saving anything** starts clean, and leaves what was saved alone.
- **Install** always installs the clean system, without what was saved.

What can be saved is limited by the free space left on the stick after the ISO, so use a stick well over the ISO's size. linuxlive tests persistence on an 8 GB stick, with the ISO written byte for byte as above.

To keep your files for good on a computer, install the distro instead: see [Installing](/help/installing/).
