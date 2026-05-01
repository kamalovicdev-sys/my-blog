---
title: 'Vibe Coding davri nihoyasiga yetdi. '
date: '2026-04-20'
---

## _Faqat tasvirlab ber va darhol ishga tushir_ davri bir muddat samarali hukm surdi. Ammo uni yakuniga yetkazgan omillar mana shular — va endilikda haqiqiy maydon qanday tus olayotgani ham aynan shudir.


<br>

![ai | dev](https://greatlakesdp.us/wp-content/uploads/2025/05/Efficiency-Speed-1024x576.webp)

<br>

Bu, davom etgan lahzalarda, chinakamiga maftunkor bir xayol edi.

<br>

Siz o‘z g‘oyangizni oddiy, ravon tilda bayon qilasiz. Sun’iy intellekt esa go‘yo sehr ila kodni yaratadi. Uni loyihangizga joylaysiz, brauzerni yangilaysiz — va tamom — ilovangiz ishga tushadi. Na kompyuter fanlari diplomi kerak, na Stack Overflow sahifalarida cheksiz sarsonlik, na tungi soat ikkidagi tinkani qurituvchi debugging jarayonlari. Faqatgina ilhom, oqim va zavq.

<br>

Bu xayolning ham o‘z nomi bor edi. OpenAI hammuassisi va Tesla’ning sobiq AI yetakchisi Andrej Karpathy 2025-yil fevralida unga “vibe coding” deb nom berdi — ya’ni dasturchi sun’iy intellekt yaratgan kodni har bir satrini chuqur anglab yetmasdan ham, “oqimga to‘liq berilgan” holda qabul qiladigan dasturlash uslubi. Hatto Collins Dictionary ham uni 2025-yilning eng muhim iborasi sifatida e’tirof etdi.

<br>

Oradan o‘n to‘rt oy o‘tgach esa, bu shirin mastlikning achchiq oqibatlari yuzaga chiqdi.

![vibecoding](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*mAgMN6rv13G4ERjZaSE_9Q.png)

<br>

### Bu orzuni bunyod etgan raqamlar

Avvalo, bu jarayon naqadar shiddat bilan rivojlanganini anglash uchun ayrim muhim ko‘rsatkichlarga nazar tashlaylik.

<br>

Y Combinator’ning 2025-yilgi qishki dasturida ishtirok etgan startaplarning 25 foizi kod bazasining kamida 95 foizini sun’iy intellekt yordamida yaratgan edi. GitHub ma’lumotlariga ko‘ra, bugungi kunda yangi qo‘shilayotgan barcha kodlarning 46 foizi AI tomonidan generatsiya qilinmoqda. Yana bir tahlilga ko‘ra, AQShdagi dasturchilarning 92 foizi endilikda AI kodlash vositalaridan har kuni foydalanadi. Cursor, Replit, Bolt, Lovable kabi platformalarning o‘zi milliardlab venchur sarmoyalarni jalb qildi; bozor hajmi esa 2026-yilda 4,7 milliard dollarga baholanib, kelasi yilga borib 12,3 milliard dollarga yetishi prognoz qilinmoqda.

<br>

Bu shunchaki o‘tkinchi urf emas edi. Sun’iy intellekt ko‘magida dasturchilar vazifalarni 25–55 foizgacha tezroq bajara boshladilar. Ayniqsa, AI yaratgan natijani chuqur tahlil qila oladigan tajribali muhandislar samaradorlikning hatto 81 foizgacha oshganini qayd etdilar. Ilgari dasturlash imkoniyatidan yiroq bo‘lgan insonlar ham endi hech qachon yarata olmas deb o‘ylagan ilovalarini bunyod eta boshladi. Dasturiy ta’minot yaratishni ommalashtirish haqidagi va’da ma’lum ma’noda rostdan ham amalga oshayotgan edi.

<br>

Xo‘sh, unda qayerda xato qilindi?

![arch](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*bAOhqZQwJni9S8E0yzyt-g.png)

#### Hech kim oshkora muhokama qilishni istamagan hisob-kitob lahzasi

<br>

2025-yil dekabrida bir tadqiqot kompaniyasi GitHub’dagi 470 ta ochiq manbali pull request’ni tahlil qildi. Natija esa noqulay, ammo inkor etib bo‘lmas edi: sun’iy intellekt hamkorligida yozilgan kodlarda inson tomonidan yozilgan kodlarga nisbatan 1,7 baravar ko‘proq jiddiy muammolar aniqlandi. Mantiqiy xatolar ko‘proq uchradi. Noto‘g‘ri konfiguratsiyalar 75 foizga tez-tez kuzatildi. Xavfsizlik zaifliklari esa inson yozgan kodga qaraganda 2,74 baravar yuqori darajada namoyon bo‘ldi.

<br>

So‘ng esa Lovable hodisasi yuz berdi.

<br>

Lovable — vibe coding olamidagi eng ommabop platformalardan biri bo‘lib, u dasturchi bo‘lmagan foydalanuvchilarga oddiy promptlar orqali haqiqiy veb-ilovalar yaratish imkonini beradi. Xavfsizlik tadqiqotchilari Lovable orqali yaratilgan 1 645 ta ilovani o‘rganib chiqdi va ulardan 170 tasida — ya’ni 10 foizdan ortig‘ida — ma’lumotlar bazasi konfiguratsiyasida kritik darajadagi row-level security nuqsonlari mavjudligini aniqladi. Bu shunchaki sinov loyihalari emas edi. Ular haqiqiy foydalanuvchi ma’lumotlari bilan ishlayotgan tizimlar edi. Oddiy ko‘nikmaga ega istalgan hujumchi bu ma’lumotlarga kirish imkoniga ega bo‘lishi mumkin edi.

<br>

Mazkur zaiflik hatto rasmiy CVE identifikatoriga ham ega bo‘ldi: CVE-2025–48757. Shu tariqa, vibe coding sanoatining ilk yirik xavfsizlik inqirozi boshlandi.

<br>

Va bu yagona holat emas edi. Tenzai nomli xavfsizlik kompaniyasi Claude Code, OpenAI Codex, Cursor, Replit hamda Devin kabi beshta mashhur vibe coding vositasi yordamida bir xil 15 ta ilova yaratib sinovdan o‘tkazdi. Natija tashvishli bo‘ldi: ushbu ilovalarda jami 69 ta zaiflik aniqlandi, ulardan 6 tasi o‘ta xavfli toifaga mansub edi.

<br>

Kod bazalaridagi “code churn” 41 foizga oshdi. Kod takrorlanishi to‘rt baravar ko‘paydi. Dasturiy infratuzilmani uzoq muddat sog‘lom saqlab turuvchi puxta refaktoring madaniyati esa keskin qulab tushdi — 2021-yilda o‘zgargan kod satrlarining 25 foizini tashkil etgan bo‘lsa, 2024-yilga kelib bu ko‘rsatkich 10 foizdan ham pastga tushdi. 2026-yil yanvaridagi akademik maqolalardan biri hatto shunday da’vo qildi: vibe coding, muhim infratuzilmani ushlab turgan maintainerlar bilan ishlab chiquvchilar aloqasini susaytirib, ochiq manbali ekotizimni sekin-asta yemirmoqda.

<br>

Orzu — tezlik edi.

<br>

Ammo uning evaziga sifat, xavfsizlik va uzoq muddatli barqarorlik qurbon qilindi.

<br>

#### “Vibe Coding tugadi” degani aslida nimani anglatadi?

<br>

Bu yerda aniqlik muhim, chunki aksar bahslar aynan shu nuqtada adashadi.

<br>

Karpathy ta’riflagan asl ma’nodagi vibe coding — ya’ni AI yaratgan kodni deyarli tekshirmasdan qabul qilib, darhol keyingisiga o‘tish — professional strategiya sifatida o‘z umrini yashab bo‘ldi. Bunga sabab vositalarning yomonlashgani emas. Balki haqiqatning o‘zi yetib kelgani.

<br>

Ilovalar production’da ishdan chiqa boshladi. Xavfsizlik teshiklari fosh etildi. Kod bazalari boshqarib bo‘lmas darajada murakkablashdi. Ha, startap dam olish kunlari ichida deyarli muhandislik bilimlarisiz prototip yaratishi mumkin. Ammo haqiqiy foydalanuvchilar kelib, kutilmagan xatti-harakatlar qila boshlaganida, AI yaratgan tayanch konstruksiya ko‘pincha bu bosimga bardosh bera olmaydi.

<br>

Tadqiqotlardan biridagi juda aniq kuzatuv buni mukammal ifodalaydi: _vibe coding mahsulot yaratishi mumkin ammo uni barqaror saqlab qola olmaydi_.


