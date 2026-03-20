---
title: 'Python orqali email рассылка yubora olamizmi ?'
date: '2026-03-17'
---

# **Qanday qilib 3200 ta korxonaga bloklanmasdan ommaviy xat yuborish tizimini yasadik? (Python)**

<br>

Tasavvur qiling: Siz o'z bizesingizni rivojlantirmoqchisiz. O'z xizmatlaringizni boshqa kanallar orqali reklama qilishingiz kerak. Aytaylik qolingingizda [Golden Pages](https://www.goldenpages.uz/en/) olgan  `db` , kompaniyangiz uchun bo'lajak mijozlaringizni minglab ro'yxati bor. 
Bu ma'lumotlarni qanday ishlatasiz, birma bir qo'ng'iroq qilish yoki xabar yuborib chiqish sizni yillab vaqtingizni olishi mumkin. Bitta tugmani bosish orqali vazifani birdaniga bajarishingiz mumkin va bu mutlaqo bepul desam bu sizga qiziq eshitiladimi ? 

![mail](https://img1.teletype.in/files/80/de/80ded7f8-97a9-4dc4-8ead-d585901efd28.jpeg)

Lekin buni qanday qilasiz? Keling jarayonni qanday bo'lishini gapirib beraman.

<br>

* Agar Corporative mail'ga kirib, 3000 ta emailni bittaga kopmaniyalarga yuborsangiz — tabriklayman, siz xalqaro spammerlar ro'yxatiga tushdingiz va pochtangiz uzoq vaqtga bloklandi (Corporative pochta orqali xabarlar yuborish soni, kunlik limit 350-500 oralig'ida).

* <br>

* Agar kuniga 100 tadan erinmay qo'lda yuborib chiqsangiz — bunga roppa-rosa 1 oy vaqtingiz olib qo'yadi. 

Manga qiziqarli buyurma tushdi. E-mail xabarlarni bo'lajak mijozlarga yuborib chiqish. Birinchi navbatda bo'lajak mijozlarni ro'yxatini yaratish. (Tez usul Golden page yoki open soure manbalardan ma'lumotlarni API orqali olish yoki Scrap qilish) Python'da o'zimizning kichkina, lekin juda "aqlli" va xavfsiz pochta jo'natuvchi dasturni yozishga qaror qildim. Ushbu postda dasturlashni unchalik tushunmaydiganlar uchun ham bu jarayon qanday ishlashini oddiy tilda tushuntirib berishga harakat qilaman.

<br>

## Bizning skriptimiz qanday ishlaydi?

<br>

Yuqorida aytganimdek mizojlarimiz kimligini segmentation qilgach ularni bazalarini opensource orqali ko'chirib oldik. (Scrap mehthod haqida keyingi postlarimda jarayonni qanday bo'lishi haqida aytib beraman)

<br>

1. **Pauza bilan yuborish:** Skript xatlarni pulemyotga o'xshab otmaydi. Har bir xat orasida 45 soniya tanaffus qiladi. Go'yoki xatni haqiqiy odam yozib jo'natayotgandek.
<br>
2. **Kunlik limit:** Kuniga faqat 400 ta xat yuboradi va o'zini avtomatik to'xtatadi. Bu Google'ning 500 talik limitidan xavfsiz masofada saqlash uchun kerak.
<br>
3. **Shaxsiylashtirish:** Hammaga bir xil zerikarli xat bormaydi. Dastur Excel (CSV) fayldan korxona nomini o'qiydi va chiroyli HTML dizayndagi xatning boshiga *"Hurmatli [Korxona Nomi] rahbariyati"* deb avtomatik qo'yib ketadi.
<br>

## Asosiy mantiq: "Aqlli xotira" (Kod qismi)

Skript yozishdagi eng katta xavf nima bilasizmi? Tasavvur qiling, botingiz 150 ta xat yubordi va chiroq o'chib qoldi yoki internet uzildi. Qayta ishga tushirsangiz, u yana 1-xatdan boshlaydimi? Unda oldingi 150 kishiga ikkinchi marta xat boradi. Bu mijozlarning g'ashiga tegadi.

Shuning uchun biz botga **xotira** qo'shdik. U har bir jo'natilgan emailni alohida `yuborilganlar.txt` degan oddiy faylga yozib boradi. 

Mana o'sha jarayonning asosiy kodi (imkon qadar soddalashtirilgan):

```python
# Oldin yuborilgan emaillarni txt fayldan o'qib olamiz
oldin_yuborilganlar = yuborilganlarni_olish()

# Bazamizdagi (Excel) har bir qatorni aylanib chiqamiz
for row in reader:
    kompaniya_nomi = row['Kompaniya nomi']
    qabul_qiluvchi = row['Email']

    # 1. Agar bu emailga oldin xat borgan bo'lsa, o'tkazib yuboramiz (continue)
    if qabul_qiluvchi in oldin_yuborilganlar:
        continue  # Bunga tegmaymiz, keyingi qatorga o't!

    # 2. Xatni tayyorlaymiz (Kompaniya nomini joylaymiz)
    shaxsiylashtirilgan_html = BODY_HTML.format(kompaniya_nomi=kompaniya_nomi)
    
    # 3. Xatni jo'natishga urinib ko'ramiz
    try:
        server.send_message(msg) # Jo'natish amali
        
        # Muvaffaqiyatli ketsa, txt faylga yozib qo'yamiz
        yuborilganni_saqlash(qabul_qiluvchi)
        oldin_yuborilganlar.add(qabul_qiluvchi) # Bot xotirasini ham yangilaymiz
        
        print(f"Muvaffaqiyatli: {kompaniya_nomi} ga xat ketdi.")
        
        # 45 soniya uxlash
        time.sleep(45)
        
    except Exception as e:
        print(f"Xatolik: {qabul_qiluvchi} ga xat bormadi.")
```

**Koddagi mantiq oddiy:** Faylni ochadi, emailni ko'radi, qora ro'yxatida (txt faylda) bormi tekshiradi. Agar bo'lsa, indamasdan keyingisiga o'tadi (`continue`). Agar yo'q bo'lsa, xat yuboradi va uni darhol ro'yxatga qo'shib qo'yadi. Shu tariqa, dastur ming marta o'chib yonsa ham, bitta odamga ikkita xat ketmaydi.

## Natija qanday ko'rinadi? (Output)

Biz jarayonni shunchaki qora ekranda emas, maxsus `.log` faylda tarix sifatida saqlanadigan qildik. Dasturni ishga tushirganingizda, u qanday qilib arilar kabi mehnat qilayotganini jonli kuzatib turish mumkin. 

Terminal (va log fayl) da chiqadigan natija taxminan mana bunday bo'ladi:

```text
2026-03-20 22:30:05 - Dastur ishga tushdi. Oldin yuborilganlar soni: 400
2026-03-20 22:30:05 - Gmail serveriga ulanilmoqda...
2026-03-20 22:30:08 - Pochtaga muvaffaqiyatli kirildi. Xatlarni yuborish boshlandi!
----------------------------------------
2026-03-20 22:30:10 - [401] Muvaffaqiyatli: "UNISPORT TECH" MCHJ (napo1991@mail.ru)
2026-03-20 22:30:56 - [402] Muvaffaqiyatli: "GREEN AGRO" LLC (info@greenagro.uz)
2026-03-20 22:31:42 - [403] Muvaffaqiyatli: "BUILD MASTER" XK (director@build.uz)
...
2026-03-20 23:15:00 - ❌ Xatolik yuz berdi (notogri_email@.ru): Noto'g'ri format
...
2026-03-21 02:45:10 - ✅ Kunlik limitga (400 ta) yetildi. Dastur o'z ishini yakunladi.
----------------------------------------
Jarayon tugadi. Bugun yuborilgan jami xatlar: 400
```

Ko'rib turganingizdek, tizim juda tartibli ishlaydi. Qaysi soat, qaysi daqiqada kimga xat ketganini, qaysi email noto'g'riligi sababli xatolik berganini bitta-bitta yozib boradi. 400 ta limitga yetgach, jimgina ishlashni to'xtatadi. 

Ertasi kuni uni yana bitta bosish bilan ishga tushiramiz va u roppa-rosa 801-korxonadan o'z ishini davom ettirib ketaveradi. Hech qanday bosh og'rig'isiz! 

Shu tariqa, marketing byudjetini tejab, butun boshli CRM va pochta jo'natish servislari qiladigan ishni kichik bir Python skripti yordamida o'zimiz uchun bepul va ishonchli tizimga aylantirdik. Agar siz ham shunday muammolarga duch kelsangiz, endi uni qanday hal qilishni bilasiz!

