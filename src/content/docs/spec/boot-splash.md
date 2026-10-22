---
title: Boot splash
description: Writing a boot splash of your own with branding.splash, a Plymouth script and its PNG images, and how to zip it for the Workshop.
---

The boot splash is what the screen shows while the computer starts, between the boot menu and the login screen or desktop. Without `branding.splash` it is your logo over a spinner. With it, the splash is your own: a [Plymouth script](https://www.freedesktop.org/wiki/Software/Plymouth/Scripts/) and the PNG images it draws. Since pipeline v0.9.0.

```yaml
branding:
  wallpaper: assets/wallpaper.png
  logo: assets/logo.png
  splash:
    script: assets/splash/splash.script
    images:
      - assets/splash/bar.png
      - assets/splash/bar-bg.png
```

## How it works

Plymouth is the program that draws the boot splash on Ubuntu and Fedora. linuxlive installs your script and images as a Plymouth theme called `linuxlive`, using Plymouth's script plugin, and packs it into the initramfs, the small file system every boot loads first.

- Your script loads each image **by file name**, without its folder: `Image("bar.png")`.
- Your **logo is there too, as `watermark.png`**. You do not list it in `images`, and no image of yours may have that name.
- Plymouth's script language can only draw images and move them. It cannot read files or run commands, so a splash is data like the wallpaper, and a spec with one can still be built with **Build it for me**.
- On Fedora the build adds the `plymouth-plugin-script` package. Ubuntu's `plymouth` already has the script plugin.

## Limits

| Limit | Value |
| --- | --- |
| Script | one UTF-8 text file, at most 64 KB |
| Images | up to 24 PNGs |
| Image names | letters, digits, `.`, `_` and `-`, starting with a letter or digit, at most 64 characters before `.png` |
| Names | each name once, even in different folders; not `watermark.png` |
| Size | the script and images together at most 8 MB |

The size limit is there because the splash rides in the initramfs, which every boot loads before anything else. Keep images small: a progress bar can be a few pixels high and scaled, and plain colours compress well.

## Where it shows

| How the computer starts | What you see |
| --- | --- |
| UEFI | Your splash |
| BIOS (since v0.9.1) | Your splash. The boot menu starts Linux in a graphical mode on BIOS too. Before v0.9.1 BIOS machines showed the text splash. |
| **safe graphics** in the boot menu | The text splash |
| A machine with no early graphics | The text splash |

On Ubuntu the text splash is linuxlive's own, with your distro's name and version and your accent colour.

:::caution
The screen can change size partway through the boot, when the graphics driver takes over from the firmware's screen. A script that works out its layout only once ends up off centre. Lay it out again whenever `Window.GetWidth()` or `Window.GetHeight()` changes, as the example below does.
:::

## Plymouth script basics

Enough to start. Plymouth's own [script documentation](https://www.freedesktop.org/wiki/Software/Plymouth/Scripts/) has the rest.

- Statements end with `;`. Lines starting with `#` are comments. Variables need no declaring: `progress = 0;`.
- Functions are written `fun name(arguments) { ... }`. `if`, `while` and `for` look as in C.
- `Image("name.png")` loads an image. `image.GetWidth()` and `image.GetHeight()` give its size. `image.Scale(width, height)` returns a resized copy.
- `Image.Text("words", red, green, blue)` makes an image of text, with colours from 0 to 1.
- `Sprite(image)` puts an image on screen. `sprite.SetPosition(x, y, z)` moves it; `SetX`, `SetY` and `SetZ` move one coordinate. Higher `z` is drawn on top. `sprite.SetImage(image)` swaps its picture.
- `Window.GetWidth()` and `Window.GetHeight()` give the screen's size. `Window.SetBackgroundTopColor(r, g, b)` and `Window.SetBackgroundBottomColor(r, g, b)` set the background, with colours from 0 to 1.
- `Math.Sin`, `Math.Pi` and `Math.Int` (rounding down) are there for movement.

Plymouth calls functions you register:

| Register with | Called |
| --- | --- |
| `Plymouth.SetRefreshFunction(f)` | many times a second; use it for animation |
| `Plymouth.SetBootProgressFunction(f)` | with `(duration, progress)`, progress from 0 to 1 as the boot goes on |
| `Plymouth.SetMessageFunction(f)` | with a message to show, for example from a disk check |
| `Plymouth.SetDisplayPasswordFunction(f)` | with `(prompt, bullets)` when the boot asks for a password |
| `Plymouth.SetDisplayNormalFunction(f)` | when a prompt is over |

## A small working splash

This script is a trimmed version of the Lawn Darts example splash in the pipeline's repository. It puts the logo above the middle of a green screen, a progress bar under it that fills as the computer starts, and messages under the bar.

The two images come from the pipeline's [make_splash_example.py](https://github.com/Eric-Ness/linuxlive/blob/main/scripts/make_splash_example.py), which writes `bar.png` (orange) and `bar-bg.png` (dark green), each 300 by 6 pixels, along with `dart.png`, which this version leaves out. Any two PNGs of the same size work.

```text
# A boot splash: the logo above the middle, a bar under it that fills as the
# computer starts, and messages under the bar. watermark.png is the logo.

Window.SetBackgroundTopColor(0.184, 0.420, 0.165);
Window.SetBackgroundBottomColor(0.184, 0.420, 0.165);

logo_image = Image("watermark.png");
logo = Sprite(logo_image);
bar_bg_image = Image("bar-bg.png");
bar_image = Image("bar.png");
bar_bg = Sprite(bar_bg_image);
bar = Sprite();
message = Sprite();
message.SetZ(30);
sw = 0;
sh = 0;

# Work out where everything goes for the screen's current size.
fun layout() {
    sw = Window.GetWidth();
    sh = Window.GetHeight();
    logo.SetPosition(sw / 2 - logo_image.GetWidth() / 2, sh * 0.42 - logo_image.GetHeight() / 2, 10);
    bar_x = sw / 2 - bar_bg_image.GetWidth() / 2;
    bar_y = sh * 0.42 + logo_image.GetHeight() / 2 + 28;
    bar_bg.SetPosition(bar_x, bar_y, 10);
    bar.SetPosition(bar_x, bar_y, 11);
    message.SetY(bar_y + 40);
}
layout();

# The screen can change size during the boot: lay it out again when it does.
fun refresh_callback() {
    if (Window.GetWidth() != sw || Window.GetHeight() != sh) layout();
}
Plymouth.SetRefreshFunction(refresh_callback);

fun progress_callback(duration, progress) {
    width = Math.Int(bar_image.GetWidth() * progress);
    if (width > 0)
        bar.SetImage(bar_image.Scale(width, bar_image.GetHeight()));
}
Plymouth.SetBootProgressFunction(progress_callback);

# Messages and password prompts (for example a disk check), under the bar.
fun message_callback(text) {
    image = Image.Text(text, 1, 1, 1);
    message.SetImage(image);
    message.SetX(sw / 2 - image.GetWidth() / 2);
}
Plymouth.SetMessageFunction(message_callback);

fun display_password_callback(prompt, bullets) {
    text = prompt + "  ";
    for (i = 0; i < bullets; i++) text = text + "*";
    message_callback(text);
}
Plymouth.SetDisplayPasswordFunction(display_password_callback);

fun display_normal_callback() {
    message.SetImage(Image.Text("", 1, 1, 1));
}
Plymouth.SetDisplayNormalFunction(display_normal_callback);
```

Save it as `assets/splash/splash.script`, put `bar.png` and `bar-bg.png` beside it, and list both images in the spec as shown at the top of this page.

The full example, with a lawn dart that arcs across the screen in the refresh function, is `examples/assets/lawndarts/splash/lawndarts.script` in the pipeline's repository. Both Lawn Darts examples use it.

:::tip
The example's images are plain PNGs drawn on the splash's own background colour, so they need no transparency.
:::

## Adding it in the Workshop

The Workshop's Look step takes a splash as one zip file, under **Boot splash**. See [Look](/workshop/look/). What the zip must hold:

- **Exactly one `.script` file**, anywhere in the zip. With none, the Workshop says "The zip has no .script file: a splash is a Plymouth script and its PNG images." With more than one: "The zip has 2 .script files; a splash has one."
- **The PNG images.** Every `.png` in the zip is taken as a splash image, by its file name; folders are ignored. Leave out PNGs the script does not use: they count towards the limits.
- Nothing else matters. Other files are ignored, and so are macOS's `__MACOSX` folder and files whose names start with a dot.

The same limits apply as in a spec, and the Workshop checks them when you choose the file, for example "watermark.png is the logo's name in the splash: rename that image." or "Two splash images are called bar.png." In the kit and in your repository, the Workshop saves the script as `assets/splash/splash.script` and each image as `assets/splash/<name>`.

To make the zip, put the script and images in one folder and compress it: on Windows, right-click the folder and choose **Send to** → **Compressed (zipped) folder**; on macOS, **Compress**; on Linux:

```bash
cd assets/splash
zip ../../splash.zip splash.script *.png
```

## How CI checks it

A build in GitHub checks the splash in the booted system:

- the Plymouth theme is `linuxlive` and uses the script module;
- the initramfs carries the theme file, `linuxlive.script`, `watermark.png`, every image you listed, and Plymouth's script plugin;
- on Ubuntu, the text-mode splash is linuxlive's own, not Ubuntu's.

CI cannot tell whether the splash looks right. To see it, every boot keeps a few screenshots from before the system is up: up to eight, one every four seconds, with blank screens skipped. They are `boot-1.png`, `boot-2.png` and so on in each boot mode's folder of the `results-<name>` artifact, for example `modes/uefi-usb/` and, since v0.9.1, the BIOS modes too. See [Results and artifacts](/spec/github-actions/#results-and-artifacts).



A script with a mistake in it is not caught by the check before the build. If the screenshots show the wrong thing, or nothing, read the script again; the checks above only prove the files arrived.
