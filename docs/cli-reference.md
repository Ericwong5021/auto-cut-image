# CLI Reference

Complete reference for the `auto-cut` command line interface.

## Usage

```bash
auto-cut [command] [options]
```

## Commands

### `auto-cut segment`

Segment an image into individual assets.

```bash
auto-cut segment <input> [options]
```

**Options:**

| Option                   | Description              | Default    |
| :----------------------- | :----------------------- | :--------- |
| `-o, --output <dir>`     | Output directory         | `./output` |
| `-f, --format <format>`  | Output format (png\|jpg) | `png`      |
| `-q, --quality <number>` | Output quality 1-100     | `95`       |

**Example:**

```bash
auto-cut segment photo.jpg --output ./output --format png
```

---

### `auto-cut bg-remove`

Remove image background.

```bash
auto-cut bg-remove <input> [options]
```

**Options:**

| Option                | Description      | Default                     |
| :-------------------- | :--------------- | :-------------------------- |
| `-o, --output <file>` | Output file path | `<input>_transparent.<ext>` |

**Example:**

```bash
auto-cut bg-remove photo.jpg --output transparent.png
```

---

### `auto-cut bg-replace`

Replace image background with a color.

```bash
auto-cut bg-replace <input> [options]
```

**Options:**

| Option                | Description                     | Default                     |
| :-------------------- | :------------------------------ | :-------------------------- |
| `-c, --color <color>` | Background color (hex or named) | `#FFFFFF`                   |
| `-o, --output <file>` | Output file path                | `<input>_bg_replaced.<ext>` |

**Example:**

```bash
auto-cut bg-replace photo.jpg --color "#FF5733" --output result.png
```

---

### `auto-cut crop`

Crop image to specified dimensions.

```bash
auto-cut crop <input> [options]
```

**Options:**

| Option                      | Description      | Default                 |
| :-------------------------- | :--------------- | :---------------------- |
| `-W, --width <number>`      | Target width     | (required)              |
| `-H, --height <number>`     | Target height    | (required)              |
| `-p, --position <position>` | Crop position    | `center`                |
| `-o, --output <file>`       | Output file path | `<input>_cropped.<ext>` |

**Position values:** `center`, `top`, `bottom`, `left`, `right`

**Example:**

```bash
auto-cut crop photo.jpg --width 800 --height 600 --position center
```

---

### `auto-cut batch`

Batch process multiple images.

```bash
auto-cut batch <dir> [options]
```

**Options:**

| Option                  | Description              | Default    |
| :---------------------- | :----------------------- | :--------- |
| `-o, --output <dir>`    | Output directory         | `./output` |
| `-f, --format <format>` | Output format (png\|jpg) | `png`      |

**Example:**

```bash
auto-cut batch ./photos --output ./processed --format png
```

## Global Options

| Option          | Description              |
| :-------------- | :----------------------- |
| `-h, --help`    | Display help information |
| `-V, --version` | Display version number   |
| `-v, --verbose` | Enable verbose logging   |

## Exit Codes

| Code | Description       |
| :--- | :---------------- |
| 0    | Success           |
| 1    | General error     |
| 2    | Invalid arguments |
| 3    | File not found    |
| 4    | Processing error  |
