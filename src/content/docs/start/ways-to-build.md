---
title: "Ways to build"
description: "Build it for me, Build it in my GitHub, the kit and your own Linux compared: what each needs, how long it takes, where the ISO ends up and what it cannot do."
---

Every way to build runs the same pipeline, with the same checks and boot tests. They differ in whose computer does the work, what you need, and what happens to the ISO afterwards.

On the Workshop's last step, **Get it**, you see **Build it for me**, **Build it in my GitHub** and **Download the kit (.zip)**. Building on your own Linux starts from the kit. The buttons themselves are described in [Get it](/workshop/get-it/).

## At a glance

| | Build it for me | Build it in my GitHub | Download the kit | Your own Linux |
| --- | --- | --- | --- | --- |
| Who builds it | linuxlive.com's build server | GitHub Actions, in a repository of yours | GitHub Actions, once you copy the template and upload the kit by hand | Your machine |
| You need | A GitHub account | A GitHub account, and the linuxlive-com app installed on the repository | A GitHub account | Linux with root, podman, QEMU and a few ISO tools |
| How long | About 15 to 20 minutes, after any builds ahead of yours | About 20 minutes for Ubuntu, 40 for Fedora | The same as in your GitHub | Depends on your machine |
| Where the ISO ends up | A download link on your [build page](/distros/build-page/) | Under **Artifacts** on the finished run, as a zip | Under **Artifacts** on the finished run, as a zip | A file on your disk |
| How long it is kept | 30 days, then deleted | 7 days; build again any time for a fresh one | 7 days; build again any time | As long as you keep it |
| Fedora-based ISO installs | No, live only | Yes | Yes | Only with a published system image |
| Scripts and GitHub code of its own | Not built | Built | Built | Built |
| ARM ISO for Apple-silicon Macs | Not built | Built if you ask for it | Built if you ask for it | See [Building locally](/spec/building-locally/) |
| Rebuilt every month | No | Yes | Yes | Up to you |
| On [My distros](/distros/my-distros/) | Under "Built for you" | Yes, with all its actions | Yes, once the linuxlive-com app can reach the repository | No |
| Into the Library | Make it in your GitHub first | From My distros | From My distros, or by pull request | By pull request |

## Build it for me

linuxlive.com builds the distro on its own server. Choose **Build it for me**, sign in with GitHub in the window that opens, and you are taken to your build's page. It shows each step as it runs, then a download with its checksum. See [The build page](/distros/build-page/).

- **Everything is public.** Anyone with the link can see the build page and download the ISO.
- **One build at a time.** The server builds one distro at a time, so yours may wait for a build machine first. A build that waits 12 hours without starting is given up: "no build machine was free; start it again".
- **Kept for 30 days.** Then the ISO and its page are deleted. There is no monthly rebuild.
- **No code of its own.** A distro with scripts or GitHub code is refused: "This distro has scripts or GitHub code of its own. linuxlive.com builds only distros without code of their own; choose Build it in my GitHub to build it there." In the Workshop the button is greyed out for such a distro. Settings, Firefox's home page and bookmarks, kiosk mode, packages, files and a boot splash are all data, so they are fine.
- **Fedora-based builds are live only.** They boot and run like any other, but cannot install: linuxlive.com publishes no system image for them, and Fedora-based distros install from one.
- **PC only.** No ARM ISO is built here.
- **Not while editing.** When you open one of your distros from My distros to change it, the Workshop offers **Save** instead.

The button shows only while linuxlive.com has its builder switched on.

To keep a distro for good, change it later, have it rebuilt every month or share it in the Library, make it in your own GitHub with the same choices.

## Build it in my GitHub

linuxlive.com makes a new public repository in your GitHub account from the [linuxlive-distro template](https://github.com/Eric-Ness/linuxlive-distro), commits your spec and art to it in one commit, and GitHub starts building straight away.

The first time, GitHub asks you to install the **linuxlive-com** app. It only gets the repositories you choose. If GitHub will not let the app make the repository, the Workshop gives you a link to make it yourself on github.com with the right name, then carries on.

- **Free.** Builds in public repositories cost nothing. Keep the repository public: a private one uses your account's Actions minutes, and GitHub Free's artifact storage (500 MB) is too small for an ISO.
- **Getting the ISO.** Open the finished run in the repository's **Actions** tab and download `iso-<your distro>` under **Artifacts**. It is a zip holding the ISO and its SHA-256 checksum, kept for 7 days.
- **It stays yours.** The repository holds your spec and art. Every change you commit builds and boot-tests a new ISO. From [My distros](/distros/my-distros/) you can change it in the Workshop, rebuild it, move it to a newer linuxlive and submit it to the Library.
- **Monthly rebuilds** are on from the start: see [Rebuilds and updates](/distros/rebuilds-and-updates/).
- **Everything works here**: scripts and GitHub code, ARM ISOs, and installable Fedora-based distros. An ARM build takes much longer than the PC one, because its boot tests run emulated.
- **At most 48 files at once.** linuxlive.com puts at most 48 files in your repository in one go. A distro with more must be uploaded by hand, from the kit.

For how the repository's workflow is set up, see [GitHub Actions](/spec/github-actions/).

## Download the kit

**Download the kit (.zip)** saves a zip made in your browser: `linuxlive.yaml`, the `assets/` folder, any `scripts/` and `files/`, and a README with the steps. Nothing is sent anywhere.

The kit's README gives two ways to build it:

1. **In your own GitHub, by hand.** Open the [template](https://github.com/Eric-Ness/linuxlive-distro), choose **Use this template**, then **Create a new repository**. In your new repository choose **Add file**, then **Upload files**, and drop in everything from the kit except the README. Commit, and the build starts. From there it is the same as **Build it in my GitHub**.
2. **On your own Linux machine** (below).

You can also open a kit in the Workshop again later to make a new version: see [Open and remix](/workshop/open-and-remix/).

## On your own Linux

The pipeline is open source: [Eric-Ness/linuxlive](https://github.com/Eric-Ness/linuxlive). With the kit and a Linux machine you can run every step yourself. You need root, podman, QEMU and a few ISO tools, and room on disk: a Fedora build uses about 30 GB at its peak. On Windows, use WSL2.

The kit's README has the commands. They start like this:

```bash
git clone https://github.com/Eric-Ness/linuxlive
cd linuxlive
python -m pip install -r requirements.txt
python -m linuxlive validate ../my-distro/linuxlive.yaml
```

[Building locally](/spec/building-locally/) covers the rest, including the boot tests. A plain local build publishes no system image, so a Fedora-based ISO built this way is live only.
