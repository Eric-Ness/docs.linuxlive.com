---
title: Base
description: Choosing Ubuntu or Fedora as the starting point, and what the ARM checkbox adds.
---

The first step asks "Which base should it start from?". The base is the Linux distribution your distro is built on. It decides where the system's packages come from, how long they are updated, and how installed computers update.

## Ubuntu or Fedora

| | Ubuntu 26.04 LTS | Fedora 44 |
| --- | --- | --- |
| The Workshop says | Five years of updates and the most widely used desktop Linux. | Newer software. Installed systems update as one image and can roll back. |
| How it is built | Starts from Ubuntu's container image and installs the desktop with apt | Starts from Fedora's Atomic desktop images (Silverblue for GNOME, Kinoite for KDE Plasma, a base Atomic image for Cinnamon) |
| Live boot | casper | dracut's dmsquash-live |
| Installing | An installer is included | The installer needs the internet: it installs the system image your build published to GitHub |
| Save files on the USB stick | Yes, if you turn it on in [Settings](/workshop/settings/) | Not yet |
| Packages in [Extras](/workshop/extras/) | Ubuntu's names, from its archive (for example `vim`) | Fedora's names (for example `vim-enhanced`) |

Ubuntu is the one picked when you open the Workshop. If you are not sure, keep it: it has the longest support and it is the only base that can keep changes on a USB stick.

Pick Fedora for newer versions of everything, and for installed computers that update as a whole image and can roll back to the one before. Fedora ISOs are larger: in the pipeline's test runs, Fedora ISOs were about 4 to 4.5 GiB and Ubuntu's about 2.7 to 2.9 GiB.

:::note
A Fedora-based distro made with **Build it for me** is live only: it boots and runs, but it has no working installer yet. Build it in your GitHub if you want Fedora to install. See [Get it](/workshop/get-it/).
:::

Your apps come from Flathub either way, so the same app list works on both bases. You can switch base at any time; the other steps keep your choices.

## Also build for ARM (Apple-silicon Macs)

Under the two bases is a checkbox, **Also build for ARM (Apple-silicon Macs)**. It is off to start with.

Tick it and the build makes a second ISO for ARM64, for virtual machines in UTM, Parallels or VMware Fusion on an Apple-silicon Mac. What it means in practice:

- PCs still get the usual ISO. The ARM one is extra.
- The ARM ISO boots through UEFI only. ARM computers have no BIOS.
- It is for virtual machines. A Mac cannot start from the USB stick itself.
- The ARM build takes longer, because its boot tests run emulated.
- The **Boots on** line on **Get it** adds "ARM64 virtual machines on Apple-silicon Macs (a second ISO)".

Some apps are made for PCs only. In the Workshop's list these are Steam, Heroic Games Launcher, Discord, Lutris, Blender, OBS Studio and Thunderbird. With ARM ticked and one of them chosen, the help under the checkbox turns into a problem, for example:

> Steam, Heroic Games Launcher, Discord are not made for ARM64: take them out, or build for PCs only.

Flathub apps you added by search are checked the same way, against the Workshop's copy of Flathub's list ("… is not made for ARM64 on Flathub."). The build checks each one with Flathub again before it starts.
