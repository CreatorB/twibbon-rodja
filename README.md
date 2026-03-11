# Twibbon Rodja - Idul Fitri Greeting Card Generator

[Ucapan Ied Rodja TV - https://ucapan.rodja.co.id](https://ucapan.rodja.co.id)

<div align="center">
  <br>
  <picture>
    <source media="(max-width: 768px)" srcset="https://raw.githubusercontent.com/CreatorB/twibbon-rodja/refs/heads/main/ss-twibbon-rodja.png" width="100%">
    <source media="(min-width: 769px)" srcset="https://raw.githubusercontent.com/CreatorB/twibbon-rodja/refs/heads/main/ss-twibbon-rodja.png" width="50%">
    <img src="https://raw.githubusercontent.com/CreatorB/twibbon-rodja/refs/heads/main/ss-twibbon-rodja.png" alt="Web Preview" width="50%">
  </picture>
  <br>
</div>

## Overview
Twibbon Rodja is a simple web-based application that allows users to generate personalized Idul Fitri greeting cards. Users can input their name, and the application will render a custom flyer with their name centered on a festive Idul Fitri background. The generated image can be downloaded or shared directly.

## Features
- **Custom Name Input:** Users can personalize the card with their name.
- **Auto-Centering Text:** Ensures that the text is properly aligned within the design.
- **Text Wrapping Support:** Handles long names gracefully by breaking them into multiple lines.
- **Live Preview:** The flyer is generated dynamically on a canvas element.
- **Download & Share:** Users can download the final image or share it directly using the Web Share.
- **Beautiful UI:** A simple and elegant design inspired by traditional Islamic themes.

## Technologies Used
- Vite (Build Tool)
- HTML5
- CSS3
- JavaScript (Canvas for dynamic image generation)

## Installation & Usage
### 1. Clone the Repository
```sh
 git clone https://github.com/CreatorB/twibbon-rodja.git
 cd twibbon-rodja
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Run Development Mode
```sh
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```sh
npm run build
```
Build result will be available in the `dist` folder.

### 5. Personalize Your Flyer
- Enter your name in the input field.
- Click the **"Buat Flyer"** button.
- Wait for the image to generate.
- Download or share the image.

## Deployment Flow (SSH + Git)

Recommended workflow:

1. Develop and test locally using Vite.
2. Commit and push to GitHub.
3. Login to server via SSH and pull latest changes.

```sh
ssh u44-ymt6jwdhjg4c@ssh.rodja.co.id -p 18765
cd ~/www/ucapan.rodja.co.id
git pull origin dev
```

If your hosting does not run Node apps directly, deploy static output from `dist` into document root.

## File Structure

I've provide the inline code, but for standart structure you can following below :

```
/ twibbon-rodja
 ├── index.html        # Main HTML file
 ├── package.json      # NPM scripts and dependencies
 ├── public/
 │   └── twibbon.png   # Background image template
 ├── src/
 │   ├── main.js       # JavaScript logic
 │   └── style.css     # CSS styles
 └── dist/             # Production build output
```

## Contributing
Contributions are welcome! Please submit a pull request if you want to enhance the project.

## License
This project is licensed under the MIT License. Feel free to modify and distribute it.


---

If you need further customization, let me know! 🚀

Hasan Syathiby / IT Syathiby 2024 | [CreatorB](https://github.com/CreatorB)
