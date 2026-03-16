---
title: 'Linux Ubuntu muhitida .exe fayli bilan qanday ishlaymiz ? '
date: '2026-01-07'
---

## **Ubuntu muhitida da Windows dasturlarini ishlatish  Wine o'zi nima va u qanday ishlaydi?**

<br>

Ubuntu'ga o'tdingiz, hammasi zo'r, tizim tez va xavfsiz. Lekin ba'zida faqat Windows'da ishlaydigan qadrdon dasturlar yoki qandaydir `.exe` fayllar kerak bo'lib qoladi. Ularni Linux'da qanday ochish mumkin? Aynan shu joyda sahnaga **Wine** chiqadi.

**Wine emulator emas**
Ko'pchilik foydalanuvchilar uni Windows emulatori deb o'ylaydi, lekin aslo unday emas hatto nomining o'zi ham qisqartma: __*Wine Is Not an Emulator*__. Emulatorlar _(masalan, VirtualBox)_ butun boshli operatsion tizimni simulyatsiya qiladi. Buning uchun esa kompyuterdan juda ko'p operativ xotira (RAM) va protsessor quvvati talab qilinadi.

Wine esa – bu shunchaki "tarjimon" __(compatibility layer)__.

![wine](https://ubunlog.com/wp-content/uploads/2015/11/wine-830x400.jpg)


**U qanday ishlaydi ?**
Tasavvur qiling, Windows dasturlari ishlashi uchun tizimga o'zining tilida (Windows API) murojaat qiladi. Masalan, dastur kompyuterga: "ekranga mana bu tugmani chiz" yoki "xotiradagi faylni o'qi" deydi. Linux yadrosi (kernel) esa bu tilni umuman tushunmaydi, chunki uning o'z arxitekturasi bor.

Wine aynan ularni o'rtasida ko'prik vazifasini bajaradi, `.exe` fayldan kelayotgan Windows API buyruqlarini o'sha soniyaning o'zida tezkorlik bilan Linux tushunadigan tilga (POSIX chaqiruvlariga) o'girib beradi.
Buning foydasi:

* Dastur xuddi o'zining "uyida" turgandek bemalol ishlaydi.
* Ortiqcha tizim resursi isrof bo'lmaydi, dasturlar xuddi Windows'dagi kabi tez (native) ishlaydi.

**Nimalar uchun qulay ?**

* Linux'da muqobili yo'q bo'lgan kichik Windows utilitalarini ishga tushirish uchun.
* Yengil dasturlarni ochish uchun.

**Lekin bitta narsani unutmang! (Muhim)**
<br>

> Hammasi ham doim silliq kechavermaydi. `.exe` faylni Wine orqali ochdingiz degani, u 100% xatosiz ishlaydi degani emas.
Ayniqsa, hardware bilan to'g'ridan-to'g'ri ishlaydigan dasturlar (masalan, fleshkaga operatsion tizim yozadigan utilitalar, apparatlarni proshivka qiluvchi dasturlar, murakkab drayverlar) ko'pincha ishlamaydi. Nega? Chunki Wine oddiy buyruqlarni tarjima qila olgani bilan, to'g'ridan-to'g'ri hardware yoki yadro darajasiga ta'sir qiluvchi so'rovlarni alday olmaydi.

<br>


![installarion](https://www.redswitches.com/wp-content/uploads/2023/12/How-to-Install-Wine-on-Ubuntu.png)




**O'rnatish va ishlatish**

1. Wine dasturini o'rnatish:

```bash
sudo apt update
sudo apt install wine

```


2. Dastur o'rnatilgandan so'ng, `.exe` faylingiz joylashgan papkaga borishiz kere (masalan, `cd Downloads`).

3. Faylni ishga tushirish uchun quyidagi buyruqni berasiz:

```bash
wine fayl_nomi.exe

```



> **Eslatma:** Dasturning qanday yozilganiga qarab, hamma `.exe` fayllar ham Wine'da 100% xatosiz ishlayvermaydi (ayniqsa (updater) dasturlar USB portlar bilan to'g'ridan-to'g'ri ishlashi kerak bo'lsa, qiyinchilik bo'lishi mumkin).

<br>


---






