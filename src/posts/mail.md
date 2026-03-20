---
title: 'Python orqali bepul email рассылка yubora olamizmi ?'
date: '2026-03-17'
---

# **Qanday qilib 3200 ta korxonaga bloklanmasdan ommaviy xat yuborish tizimini yasadik? (Python)**

<br>

Tasavvur qiling: Siz o'z bizesingizni rivojlantirmoqchisiz. O'z xizmatlaringizni boshqa kanallar orqali reklama qilishingiz kerak. Aytaylik qolingingizda [Golden Pages](https://www.goldenpages.uz/en/) olgan  `db` , kompaniyangiz uchun bo'lajak mijozlaringizni minglab ro'yxati bor. 
Bu ma'lumotlarni qanday ishlatasiz, birma bir qo'ng'iroq qilish yoki xabar yuborib chiqish sizni yillab vaqtingizni olishi mumkin. Bitta tugmani bosish orqali vazifani birdaniga bajarishingiz mumkin va bu mutlaqo bepul desam bu sizga qiziq eshitiladimi ? 

![mail](https://img1.teletype.in/files/80/de/80ded7f8-97a9-4dc4-8ead-d585901efd28.jpeg)

Lekin buni qanday qilasiz? Keling jarayonni qanday bo'lishini gapirib beraman.

<br>

* Agar Corporative mail'ga kirib, 3000 ta emailni birdaniga kompaniyalarga yuborsangiz — tabriklayman, siz xalqaro spammerlar ro'yxatiga tushdingiz va pochtangiz uzoq vaqtga bloklandi (Corporative pochta orqali xabarlar yuborish soni, kunlik limit 350-500 oralig'ida).

* <br>

* Agar kuniga 100 tadan erinmay qo'lda yuborib chiqsangiz — bunga roppa-rosa 1 oy vaqtingiz olib qo'yadi. 

Sizga kompaniyangiz tomonidan qiziqarli vazifa berildi. E-mail xabarlarni bo'lajak mijozlarga yuborib chiqishingiz kerak. _Xo'sh nima qilasiz ?_ Birinchi navbatda bo'lajak mijozlarni ro'yxatini yaratishingiz kerak. (Tez usul Golden page yoki opensoure manbalardan ma'lumotlarni  `API`  orqali olish yoki  `Scrap`  qilish) Python'da juda "aqlli" va xavfsiz pochta jo'natuvchi dasturni yozishingiz mumkin.
 <br>
 Ushbu postda dasturlashni unchalik tushunmaydiganlar uchun ham bu jarayon qanday ishlashini oddiy tilda tushuntirib berishga harakat qilaman.

<br>

## Dastur skripti qanday ishlaydi?

<br>

Yuqorida aytganimdek mizojlarimiz kimligini segmentation qilgach ularni bazalarini opensource orqali ko'chirib olish kerak. (Scrap mehthod haqida keyingi postlarimda jarayonni qanday bo'lishi haqida aytib beraman)

<br>

1. **Pauza bilan yuborish:** Skript xatlarni bittada yubobmang. Har bir yuboriluvchi xat orasida 45 soniya tanaffus qilish kerak. Go'yoki xatni haqiqiy odam yozib jo'natayotgandek.
<br>
2. **Kunlik limit:** Kuniga faqat 400 ta xat yuborasiz va dastur o'zini avtomatik to'xtatadi. Bu qoidalar'ning 500 talik limitidan xavfsiz masofada saqlash uchun kerak.
<br>
3. **Shaxsiylashtirish:** Hammaga bir xil zerikarli xat bormaydi. Dastur Excel (CSV) fayldan korxona nomini o'qiydi va chiroyli HTML dizayndagi xatning boshiga *"Hurmatli [Korxona Nomi] jamoasi"* deb avtomatik qo'yib ketadi.

<br>

## Asosiy mantiq: "Aqlli xotira" 

<br>

Skript yozishdagi eng katta xavf nima bilasizmi? Tasavvur qiling, botingiz 150 ta xat yubordi va chiroq o'chib qoldi yoki internet uzildi. Qayta ishga tushirsangiz, u yana 1-xatdan boshlaydimi? Unda oldingi 150 kishiga ikkinchi marta xat boradi-ku. Bu mijozlarning g'ashiga tegishi mumkin va tabiyki Companiyangiz xabarlarni Spamga tushadi. **_Marhamat qilib SPAMga boring_**.

Shuning uchun botga **xotira** qo'shish kerak bo'ladi. U har bir jo'natilgan emailni alohida `yuborilganlar.txt` degan oddiy faylga yozib boradi. Jarayon izdan chiqganida soniyaning milli-soniyasida o'sha fayl ichidagi  `log`  ni ko'rib chiqadi va yuborilgan mail pochtalarni  `skip`  qilib yuboradi.

<br>

```python
# Oldin yuborilgan emaillarni txt fayldan o'qib chiqadi
oldin_yuborilganlar = yuborilganlarni_olish()

# (Excel) har bir qatorni aylanib chiqadi
for row in reader:
    kompaniya_nomi = row['Kompaniya nomi']
    qabul_qiluvchi = row['Email']

    # Agar bu emailga oldin xat borgan bo'lsa, o'tkazib yuboramiz (skip)
    if qabul_qiluvchi in oldin_yuborilganlar:
        continue  # Bunga tegmaymiz, keyingi qatorga o't!

    # 2. Xatni tayyorlaymiz (Kompaniya nomini joylaymiz)
    shaxsiylashtirilgan_html = BODY_HTML.format(kompaniya_nomi=kompaniya_nomi)
    
    # 3. Xatni yuborish
    try:
        server.send_message(msg) 
        
        # Muvaffaqiyatli yuborsa, txt faylga yozib qo'yamiz
        yuborilganni_saqlash(qabul_qiluvchi)
        oldin_yuborilganlar.add(qabul_qiluvchi) # Bot xotirasini ham yangilaymiz
        
        print(f"Muvaffaqiyatli: {kompaniya_nomi} ga xat ketdi.")
        
        # 45 soniya limitation qo'yilgan buni qisqartirish ham mumkin lekin blokga tushish havfi bor
        time.sleep(45)
        
    except Exception as e:
        print(f"Xatolik: {qabul_qiluvchi} ga xat bormadi.")
```

<br>

**Koddagi mantiq oddiy:** Faylni ochadi, emailni ko'radi, (txt faylda) bormi tekshiradi. Agar bo'lsa, indamasdan keyingisiga o'tadi (`continue`). Agar yo'q bo'lsa, xat yuboradi va uni darhol ro'yxatga qo'shib qo'yadi. Shu tariqa, dastur ming marta o'chib yonsa ham, bitta odamga ikkita xat ketmaydi.

<br>

## Natija qanday ko'rinadi? (Output)

<br>

 Dastur jarayonni shunchaki qora ekranda emas, maxsus `.log` faylda tarix sifatida saqlanadigan qildim. Dasturni ishga tushirganingizda, u qanday qilib arilar kabi mehnat qilayotganini jonli kuzatib turishingiz mumkin.

<br>

```text
2026-03-20 22:30:05 - Dastur ishga tushdi. Oldin yuborilgan mail'lar soni: 400
2026-03-20 22:30:05 - Gmail serveriga ulanmoqda...
2026-03-20 22:30:08 - Pochtaga muvaffaqiyatli kirildi. Xatlarni yuborish boshlandi!
----------------------------------------
2026-03-20 22:30:10 - [401] Muvaffaqiyatli: "Google LLC (info@google.com)
2026-03-20 22:30:56 - [402] Muvaffaqiyatli: "Yandex" LLC (info@yandex.uz)
2026-03-20 22:31:42 - [403] Muvaffaqiyatli: "BUILD MASTER" LLC (example@.uz)
...
2026-03-20 23:15:00 - ❌ Xatolik yuz berdi (notogri_email@.ru): Noto'g'ri format
...
2026-03-21 02:45:10 - ✅ Kunlik limitga (400 ta) yetildi. Dastur o'z ishini yakunladi.
----------------------------------------
Jarayon tugadi. Bugun yuborilgan jami xatlar soni: 400
```

<br>

Ko'rib turganingizdek, tizim juda tartibli ishlaydi. Qaysi soat, qaysi daqiqada kimga xat ketganini, qaysi email noto'g'riligi sababli xatolik berganini  `log`  ko'rinishida yozib boradi. 400 ta limitga yetgach, jimgina ishlashni to'xtatadi. 
<br>
Ertasi kuni uni yana bitta bosish bilan ishga tushiramiz va u roppa-rosa to'xtagan joyidan o'z ishini davom ettirib ketaveradi. Hech qanday bosh og'rig'isiz! 

<br>

**Mijozlaringiz pochtasiga xabarlar qanday ko'rinishda boradi ?** 

<br>

![mail_viev](https://www.mailjet.com/wp-content/uploads/2025/04/Screenshot-2019-09-24-at-14.08.07.png)

<br>

Har bir yuborilgan mail xabarlar  `html` design ko'rinishida yetib boradi va siz ularni ham analysis qilishingiz va A/B testing o'tkazishingiz mumkin. 

<br>

Shu tariqa siz ham, marketing byudjetini tejab, butun boshli CRM va pochta jo'natish servislari qiladigan ishni kichik bir Python skripti yordamida o'zingiz uchun bepul va ishonchli tizimga yasashingiz mumkin. Agar sizda ham shunday muammolarg paydo bo'lsa, endi uni qanday hal qilishni bilasiz!

<br>

**O'xshash xizmatlar** bormi ?

<br>

Albatta o'xshash xizmatlar mavjud. **Brevo**, **SendPulus** va boshqa saytlar pullik o'z xizmatlarini taklif qilib kelishadi, bu sizga oyiga taminan **$200** tushadi (Tayyor ma'lumotlar bazasi bilan hisoblaganda).  



