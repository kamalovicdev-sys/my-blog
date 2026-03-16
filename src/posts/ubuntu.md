---
title: 'Ubuntu Lifehack '
date: '2026-03-15'
---


Ubuntuni go'zal tomoni uni o'zingiz hohlagancha o'zgartirishlar kiritib user-friendly qilishingiz mumkin. 
 Laptopni o'chirib keyin qayta ishga tushurganimda password kiritish jonimga tegdi. Paswordsiz ishlatamanmi yo'q. Usb ulash orqali qurilmamga passwordsiz kiraman. 

![Ubuntu](https://linuxiac.com/wp-content/uploads/2020/06/ubuntu-linux.jpg)


Keling  uni logikasi qanaqa ishlashini aytaman. Siz laptopni ishga tushirganizda Enter tugmasini bosilsa jarayon  quyidagicha ishlaydi:

**Tekshirish:** Biz yozgan skript kompyuterga ulangan qurilmalar ro'yxati turadigan maxsus jildga  `/dev/disk/by-uuid/` qaraydi.

**Tasdiqlash:** Agar o'sha jildda sizning UUID raqamingizdagi fleshka borligini ko'rsa, skript kompyuterning xavfsizlik tizimiga `(PAM)` "Hammasi joyida, bu odamga ruxsat berish mumkin" degan signal `(exit 0)` yuboradi.

**Cheklab o'tish:** Ushbu signalni olgach, kompyuter sizdan qandaydir parol so'rash jarayonini umuman bekor qiladi va sizni to'g'ridan-to'g'ri tizimga kiritib yuboradi.

**Rad etish:** Agar skript u jildda sizning fleshkangizni topa olmasa, tizimga "Men ruxsat bera olmayman" deydi, va tizim sizdan odatdagi  parolingizni kiritishingizni so'rashda davom etadi.
<br>

**‼️Muhim:** Bu degani hozir kompyuteringiz xavfsizligi endi qisman shu fleshkaga bog'liq. Agar kimdir bu fleshkani kompyuteringizga ulasa, u kompyuter parolini bilmasa ham profilingizga bemalol kira oladi. Fleshkani yo'qotib qo'ymang 🤫

<br>
Keling endi buni qilishni boshlaymiz.
<br>

1. Ubuntu OS quribmaga xotira kartasini ulang. Bu buyriq bilan kompyuterdagi barcha disklar ro'yxati chiqadi. UUID yozib qo'ying
<br>
```
lsblk -f
```

2. Endi kompyuterimizga fleshka ulanganini tekshirib beruvchi fayl yaratamiz.
```
sudo nano /usr/local/bin/usb_login.sh
```
GNU nano oynasi ochiladi. va siz bu skriptni kiritishingiz kerak
<br>
```
#!/bin/bash
if [ -e "/dev/disk/by-uuid/SIZNING-UUID-KODINGIZ" ]; then
    exit 0
else
    exit 1
fi
```
Yuqoridagi uuid shu yrga yozasiz. uuid ABCD-1234 tahminan shunaqa bo'ladi.  
Saqlash uchun `Ctrl + O` ni bosing, `Enter` bilan tasdiqlang va `Ctrl + X`  chiqing


3. Skriptimizni tizim o'qishi  uchun unga ruxsatni berishimiz kere
<br>
```
sudo nano /etc/pam.d/common-auth
```
<br>

4. Endi tizim kirish sozlamalarini tahrirlaymiz
<br>
```
sudo nano /etc/pam.d/common-auth
```
<br>

Faylning ichidan `auth [success=1 default=ignore] pam_unix.so nullok` degan qatorni qidiring. 
 shu qatorning tepasiga quyidagini yozing:
<br>

```
auth    sufficient    pam_exec.so quiet /usr/local/bin/usb_login.sh
```
keyin esa  `Ctrl + O`, `Enter`  va  `Ctrl + X`


Endi ishlatib ko'ring, terminalda `sudo reboot` yoki  shunchaki `super + L`