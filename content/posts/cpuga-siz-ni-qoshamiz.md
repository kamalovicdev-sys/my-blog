---
title: CPU’ga “Siz”ni qo‘shamiz
date: '2026-11-13'
description: >-
  Kompyuteringizda biror dasturni ishga tushirganingizda aynan nimalar sodir
  bo‘lishiga qiziqqanmisiz? Ko‘p jarayonli ishlash (multiprocessing) qanday
  tashkil etilishi, tizim chaqiruvlari (system calls) aslida nima ekanligi,
  kompyuterlar apparat uzilishlari (hardware interrupts) yordamida xotirani
  qanday boshqarishi hamda Linux bajariluvchi fayllarni qanday yuklashini bilib
  olish uchun ushbu maqolani o‘qing.
tags:
  - algorithm
  - Critical Thinking
  - Computer
  - iOS
  - Linux
  - Windows
draft: false
---

## Eng boshidan boshlasak…

Kompyuterlar bilan [ko‘p ishlarni qilganman](https://github.com/kognise?tab=overview&from=2023-12-01&to=2023-12-31), lekin bilimlarimda doim bir bo‘shliq bor edi: kompyuterda dasturni ishga tushirganingizda aynan nima sodir bo‘ladi? Bu bo‘shliq haqida ko‘p o‘ylardim — menda zarur bo‘lgan quyi darajadagi (low-level) bilimlarning aksariyati bor edi, biroq barcha qismlarni bir-biriga bog‘lab, yaxlit tasavvur hosil qilishga qiynalardim. Dasturlar rostdan ham to‘g‘ridan-to‘g‘ri protsessorda (CPU) bajariladimi yoki boshqa biror jarayon ham kechadimi? Men tizim chaqiruvlaridan (syscall) foydalanganman, lekin ular qanday ishlaydi? Ular aslida nima o‘zi? Bir vaqtning o‘zida bir nechta dastur qanday qilib parallel ishlay oladi?

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz.webp)

Oxiri sabrim chidamadi va imkon qadar ko‘proq narsaning tagiga yetishga kirishdim. Agar universitetda o‘qimasangiz, tizimli dasturlash bo‘yicha keng qamrovli manbalar unchalik ko‘p emas; shu sababli sifati turlicha bo‘lgan va ba’zan bir-biriga zid ma’lumotlarni o‘z ichiga olgan juda ko‘p manbalarni elakdan o‘tkazishimga to‘g‘ri keldi. Bir necha haftalik izlanishlar va qariyb 40 sahifalik qaydlar yozganimdan so‘ng, kompyuterlar ishga tushishidan tortib dastur bajarilishigacha bo‘lgan jarayonda qanday ishlashini ancha yaxshiroq tushunib yetdim, deb o‘ylayman. O‘rganganlarimni sodda va aniq tushuntirib beradigan bittagina puxta maqola topish uchun hamma narsaga tayyor edim — shuning uchun o‘zim orzu qilgan o‘sha maqolani yozishga qaror qildim.

Bilasiz-ku, biror narsani boshqa birovga tushuntirib bera olsangizgina, uni chinakamiga tushungan bo‘lasiz, deyishadi.

> Shoshilyapsizmi? Bularning barchasini allaqachon bilaman deb o‘ylaysizmi?
Unda 3-bobni o‘qib ko‘ring — albatta o‘zingiz uchun yangi biror narsa kashf etishingizga kafolat beraman. Agar, albatta, shaxsan Linus Torvaldsning o‘zi bo‘lmasangiz.

## 1-bob: “Asoslar”

> Putting the “You” in CPU turkumidan: kompyuteringiz dasturlarni qanday ishga tushirishi haqidagi chuqur tahlil.

Ushbu maqolani yozish davomida meni qayta-qayta hayratga solgan yagona narsa — kompyuterlarning naqadar sodda ekanligi bo‘ldi. Aslida mavjud bo‘lganidan ko‘ra ko‘proq murakkablik yoki abstraksiya kutib, o‘zimni chalg‘itmaslik hali ham qiyin! Davom etishdan oldin miyangizga muhrlab qo‘yishingiz kerak bo‘lgan bir narsa bor: sodda ko‘ringan hamma narsa haqiqatan ham shunchalik sodda. Bu soddalik juda go‘zal va ba’zan juda-juda g‘alati (cursed).

Keling, kompyuteringizning eng tub mohiyatida qanday ishlashi asoslaridan boshlaylik.

### Kompyuterlar qanday tuzilgan (Arxitektura)

Kompyuterning markaziy protsessori (CPU) barcha hisob-kitoblar uchun javobgardir. U — boshliq. Haqiqiy sehrgar. Kompyuterni yoqishingiz bilanoq u g‘izillab ishga tushadi va buyruq ketidan buyruqni tinimsiz bajara boshlaydi.

Ommaviy ishlab chiqarilgan birinchi CPU — [Intel 4004](http://www.intel4004.com/) bo‘lib, u 60-yillarning oxirida Federiko Fajin (Federico Faggin) ismli italiyalik fizik va muhandis tomonidan loyihalashtirilgan. U bugungi kunda biz foydalanadigan [64-bitli](https://en.wikipedia.org/wiki/64-bit_computing) tizimlar o‘rniga 4-bitli arxitekturaga ega edi va zamonaviy protsessorlarga qaraganda ancha sodda bo‘lgan, biroq o‘sha soddalikning katta qismi hanuzgacha saqlanib qolgan.

Protsessorlar bajaradigan «buyruqlar» (instructions) shunchaki ikkilik (binar) ma’lumotlardir: qaysi buyruq bajarilayotganini bildiruvchi bir yoki ikki bayt (opkod — operatsiya kodi) va uning ortidan buyruqni bajarish uchun zarur bo‘lgan ma’lumotlar keladi. Biz mashina kodi deb ataydigan narsa ketma-ket joylashgan mana shunday ikkilik buyruqlar to‘plamidan boshqa narsa emas. Assembler ([Assembly](https://en.wikipedia.org/wiki/Assembly_language)) esa mashina kodini o‘qish va yozish uchun qulay sintaksis bo‘lib, xom bitlarga qaraganda insonlar o‘qishi va yozishi uchun ancha oson; u har doim protsessoringiz o‘qiy oladigan ikkilik kodga kompilyatsiya qilinadi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-1.webp)

> Mulohaza: Buyruqlar mashina kodida har doim ham yuqoridagi misoldagidek 1:1 nisbatda ifodalanavermaydi. Masalan, `add eax, 512` buyrug‘i `05 00 02 00 00` ko‘rinishiga o‘giriladi.
Birinchi bayt (`05`) aynan EAX registriga 32-bitli sonni qo‘shishni bildiruvchi opkoddir. Qolgan baytlar esa [little-endian](https://en.wikipedia.org/wiki/Endianness) bayt tartibida yozilgan 512 (`0x200`) sonini anglatadi.
Defuse Security assembler va mashina kodi o‘rtasidagi tarjima bilan tajriba o‘tkazib ko‘rish uchun [foydali vosita](https://defuse.ca/online-x86-assembler.htm) yaratgan.

**RAM (operativ xotira)** — kompyuteringizning asosiy xotira banki bo‘lib, kompyuterda ishlayotgan dasturlar foydalanadigan barcha ma’lumotlarni saqlaydigan katta, ko‘p maqsadli makondir. Bunga dastur kodining o‘zi ham, operatsion tizim yadrosidagi kod ham kiradi. CPU mashina kodini har doim to‘g‘ridan-to‘g‘ri RAM’dan o‘qiydi va agar kod RAM’ga yuklanmagan bo‘lsa, uni ishga tushirib bo‘lmaydi.

Protsessor o‘zida buyruqlar ko‘rsatkichini *(instruction pointer)* saqlaydi, u keyingi buyruqni RAM’ning qaysi manzilidan olish kerakligini ko‘rsatib turadi. Har bir buyruqni bajargandan so‘ng, CPU ko‘rsatkichni siljitadi va jarayonni takrorlaydi. Bu olish va bajarish sikli *(fetch-execute cycle)* deb ataladi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-2.webp)

Buyruq bajarilgandan so‘ng, ko‘rsatkich RAM’da xuddi shu buyruqdan darhol keyingi o‘ringa siljiydi va endi keyingi buyruqqa ishora qiladi. Kod aynan shuning uchun ishlaydi! Buyruqlar ko‘rsatkichi shunchaki oldinga qarab intiladi va xotirada qanday tartibda saqlangan bo‘lsa, mashina kodini o‘sha tartibda bajarib boraveradi. Ayrim buyruqlar esa ko‘rsatkichga boshqa joyga «sakrashni» (jump) yoki ma’lum bir shartga qarab turli joylarga sakrashni buyurishi mumkin — bu esa qayta ishlatiladigan kod va shartli mantiqni yaratish imkonini beradi.

Ushbu buyruqlar ko‘rsatkichi registrda saqlanadi. [Registrlar](https://en.wikipedia.org/wiki/Processor_register) — bu protsessor o‘qishi va yozishi uchun o‘ta tezkor bo‘lgan kichik xotira katakchalaridir. Har bir CPU arxitekturasi hisob-kitoblar paytida vaqtinchalik qiymatlarni saqlashdan tortib protsessorni sozlashgacha bo‘lgan barcha vazifalar uchun ishlatiladigan qat’iy registrlar to‘plamiga ega.

Ba’zi registrlarga, masalan, `ebx` registriga mashina kodidan to‘g‘ridan-to‘g‘ri murojaat qilish mumkin. Boshqa registrlar esa faqat protsessorning o‘zi tomonidan ichki tarzda ishlatiladi, lekin ularni ko‘pincha maxsus buyruqlar yordamida yangilash yoki o‘qish mumkin. Bunga misol sifatida buyruqlar ko‘rsatkichini keltirish mumkin: uni to‘g‘ridan-to‘g‘ri o‘qib bo‘lmaydi, ammo masalan, sakrash (jump) buyrug‘i orqali yangilash mumkin.

### Protsessorlar sodda bo‘ladi

Keling, dastlabki savolga qaytaylik: kompyuteringizda bajariluvchi dasturni (executable) ishga tushirganingizda nima sodir bo‘ladi? Avvaliga uni ishga tushirishga tayyorlash uchun bir talay «sehrgarlik» yuz beradi — biz bularning barchasini keyinroq ko‘rib chiqamiz — lekin jarayon oxirida qayerdadir fayl ichida mashina kodi turgan bo‘ladi. Operatsion tizim uni RAM’ga yuklaydi va protsessorga buyruqlar ko‘rsatkichini RAM’dagi o‘sha manzilga sakratishni buyuradi. CPU odatdagidek o‘zining olish-bajarish siklini davom ettiradi va shu tariqa dastur ishlay boshlaydi!

(Bu men uchun o‘zimni hayratga solgan lahzalardan biri edi — jiddiy aytaman, siz ushbu maqolani o‘qiyotgan brauzer dasturi ham xuddi shunday ishlamoqda! Protsessoringiz brauzeringiz buyruqlarini RAM’dan ketma-ket olib, to‘g‘ridan-to‘g‘ri bajarmoqda va ular ushbu maqolani ekranda chizib bermoqda.)

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-3.webp)

Ma’lum bo‘lishicha, protsessorlar dunyoga o‘ta sodda nazar bilan qaraydi; ular faqat joriy buyruqlar ko‘rsatkichini va biroz ichki holatni ko‘radi xolos. Jarayonlar (processes) esa butunlay operatsion tizim abstraksiyalari bo‘lib, protsessorlar ularni tabiiy ravishda tushunmaydi yoki kuzatib bormaydi.

*qo‘llarini silkitib* jarayonlar — bu ko‘proq kompyuter sotish uchun OT dasturchilari va «katta bayt» korporatsiyalari o‘ylab topgan abstraksiyadir.

Men uchun bu holat javoblardan ko‘ra ko‘proq savollarni keltirib chiqardi:

1. Agar CPU ko‘p jarayonlilik (multiprocessing) haqida bilmasa va buyruqlarni shunchaki ketma-ket bajarsa, nega u o‘zi ishga tushirgan birorta dastur ichida qolib ketmaydi? Qanday qilib bir vaqtning o‘zida bir nechta dastur ishlay oladi?

2. Agar dasturlar to‘g‘ridan-to‘g‘ri CPU’da ishlasa va CPU RAM’ga to‘g‘ridan-to‘g‘ri kira olsa, nega kod boshqa jarayonlarning yoki, xudo ko‘rsatmasin, yadroning (kernel) xotirasiga kira olmaydi?

3. Aytgancha, har bir jarayonning istalgan buyruqni bajarishi va kompyuteringizga xohlagan ishini qilishining oldini oladigan mexanizm nima? VA O‘SHA SYSCALL DEGAN MATOH NIMA O‘ZI?

Xotira haqidagi savol alohida bo‘limga loyiq va 5-bobda yoritilgan — qisqasi (TL;DR) shuki, xotiraga qilinadigan aksariyat murojaatlar aslida butun manzillar makonini qayta xaritalaydigan (remap) chalg‘ituvchi qatlam orqali o‘tadi. Hozircha esa dasturlar barcha RAM’ga to‘g‘ridan-to‘g‘ri kira oladi va kompyuterlar bir vaqtda faqat bitta jarayonni bajara oladi, deb faraz qilib turamiz. Vaqti kelib bu ikkala farazni ham fosh etamiz.

Endi esa tizim chaqiruvlari (syscalls) va xavfsizlik halqalariga to‘la olam sari birinchi chuqurlikka sakrash vaqti keldi.

> Mulohaza: aytgancha, yadro (kernel) nima o‘zi?
Kompyuteringizning macOS, Windows yoki Linux kabi operatsion tizimi — bu kompyuterda ishlaydigan va barcha asosiy narsalarning ishlashini ta’minlaydigan dasturiy ta’minot to‘plamidir. «Asosiy narsalar» juda umumiy tushuncha, «operatsion tizim» ham shunday — kimdan so‘rashingizga qarab, u kompyuteringiz bilan birga keladigan standart ilovalar, shriftlar va piktogrammalarni ham o‘z ichiga olishi mumkin.
Yadro (kernel) esa operatsion tizimning o‘zagidir. Kompyuterni yoqqaningizda, buyruqlar ko‘rsatkichi qayerdadir joylashgan bir dasturdan ish boshlaydi. O‘sha dastur — yadrodir. Yadro kompyuteringiz xotirasi, tashqi qurilmalari (periferiya) va boshqa resurslariga deyarli to‘liq kirish huquqiga ega hamda kompyuteringizga o‘rnatilgan dasturlarni (ular userland — foydalanuvchi makoni dasturlari deb ataladi) ishga tushirish uchun mas’uldir. Yadro bu huquqqa qanday ega ekanligi — va userland dasturlari nega ega emasligi haqida ushbu maqola davomida bilib olamiz.
Linux shunchaki yadro bo‘lib, undan foydalanish uchun qobiqlar (shells) va displey serverlari kabi ko‘plab userland dasturlari kerak bo‘ladi. macOS yadrosi [XNU](https://en.wikipedia.org/wiki/XNU) deb ataladi va Unix-simon tuzilishga ega, zamonaviy Windows yadrosi esa [NT Kernel](https://en.wikipedia.org/wiki/Architecture_of_Windows_NT) deb nomlanadi.

### Barchasini boshqaruvchi ikki halqa

Protsessor qaysi rejimda (ba’zan imtiyoz darajasi yoki halqa — ring deb ham ataladi) turgani unga nimalar qilishga ruxsat berilganini belgilaydi. Zamonaviy arxitekturalarda kamida ikkita variant mavjud: yadro rejimi (kernel/supervisor mode) va foydalanuvchi rejimi (user mode). Arxitektura ikkitadan ko‘p rejimni qo‘llab-quvvatlashi mumkin bo‘lsa-da, bugungi kunda odatda faqat yadro rejimi va foydalanuvchi rejimi ishlatiladi.

Yadro rejimida hamma narsa mumkin: CPU qo‘llab-quvvatlanadigan istalgan buyruqni bajarishi va istalgan xotira manziliga kira oladi. Foydalanuvchi rejimida esa buyruqlarning faqat cheklangan qismiga ruxsat beriladi, kiritish/chiqarish (I/O) va xotiraga kirish cheklanadi, ko‘plab CPU sozlamalari esa qulflangan bo‘ladi. Odatda yadro va drayverlar yadro rejimida, ilovalar esa foydalanuvchi rejimida ishlaydi.

Protsessorlar ishni yadro rejimida boshlaydi. Biror dasturni ishga tushirishdan oldin yadro foydalanuvchi rejimiga o‘tishni boshlaydi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-4.webp)

Protsessor rejimlari haqiqiy arxitekturada qanday namoyon bo‘lishiga bir misol: x86-64 arxitekturasida joriy imtiyoz darajasini (CPL — Current Privilege Level) `cs` (kod segmenti) deb nomlangan registrdan o‘qish mumkin. Aniqrog‘i, CPL `cs` registrining [eng kichik ikkita bitida](https://en.wikipedia.org/wiki/Bit_numbering) joylashgan bo‘ladi. Ushbu ikki bit x86-64’ning to‘rtta mumkin bo‘lgan halqasini saqlay oladi: 0-halqa (ring 0) — yadro rejimi, 3-halqa (ring 3) — foydalanuvchi rejimidir. 1 va 2-halqalar drayverlarni ishga tushirish uchun mo‘ljallangan, biroq ulardan faqat sanoqli eski va tor doiradagi operatsion tizimlargina foydalanadi. Masalan, agar CPL bitlari `11` bo‘lsa, CPU 3-halqada, ya’ni foydalanuvchi rejimida ishlayotgan bo‘ladi.

### Syscall (tizim chaqiruvi) o‘zi nima?

Dasturlar kompyuterga to‘liq kirish huquqi bilan ishonib topshirilishi mumkin emasligi sababli foydalanuvchi rejimida ishlaydi. Foydalanuvchi rejimi o‘z vazifasini bajarib, kompyuterning katta qismiga kirishni to‘sib qo‘yadi — lekin dasturlar qandaydir yo‘l bilan kiritish/chiqarish (I/O) qurilmalaridan foydalanishi, xotira ajratishi va operatsion tizim bilan o‘zaro aloqa qilishi kerak-ku! Buning uchun foydalanuvchi rejimida ishlayotgan dastur operatsion tizim yadrosidan yordam so‘rashi lozim. Shunda OT dasturlarning zararli harakatlar qilishining oldini olish uchun o‘zining xavfsizlik himoyalarini qo‘llay oladi.

Agar qachondir OT bilan o‘zaro aloqa qiladigan kod yozgan bo‘lsangiz, ehtimol `open`, `read`, `fork` va `exit` kabi funksiyalarni taniysiz. Bir nechta abstraksiya qatlamlari ostida bu funksiyalarning barchasi OT’dan yordam so‘rash uchun tizim chaqiruvlaridan (system calls / syscalls) foydalanadi. Tizim chaqiruvi — bu dasturga foydalanuvchi makonidan yadro makoniga o‘tishni boshlash, ya’ni dastur kodidan OT kodiga sakrash imkonini beruvchi maxsus protseduradir.

Foydalanuvchi makonidan yadro makoniga boshqaruvni uzatish dasturiy uzilishlar [software interrupts](https://en.wikipedia.org/wiki/Interrupt#Software_interrupts) deb ataladigan protsessor xususiyati yordamida amalga oshiriladi:

1. Kompyuter yuklanayotganda (boot jarayonida) operatsion tizim RAM’da uzilishlar vektori jadvali (IVT — [Interrupt Vector Table](https://en.wikipedia.org/wiki/Interrupt_vector_table); x86-64 arxitekturasida bu [uzilishlar deskriptori jadvali](https://en.wikipedia.org/wiki/Interrupt_descriptor_table) deb ataladi) deb nomlangan jadvalni saqlaydi va uni CPU’da ro‘yxatdan o‘tkazadi. IVT uzilish raqamlarini ularni qayta ishlovchi kod ko‘rsatkichlari bilan bog‘laydi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-5.webp)

2. Shundan so‘ng, userland dasturlari [INT](https://www.felixcloutier.com/x86/intn:into:int3:int1) kabi buyruqdan foydalanishi mumkin. Bu buyruq protsessorga ko‘rsatilgan uzilish raqamini IVT’dan izlashni, yadro rejimiga o‘tishni va buyruqlar ko‘rsatkichini IVT’da saqlangan xotira manziliga sakratishni buyuradi.

Yadro kodi o‘z ishini tugatgach, CPU’ga yana foydalanuvchi rejimiga qaytishni va buyruqlar ko‘rsatkichini uzilish sodir bo‘lgan paytdagi o‘z joyiga qaytarishni buyurish uchun [IRET](https://www.felixcloutier.com/x86/iret:iretd:iretq) kabi buyruqdan foydalanadi.

(Agar qiziqayotgan bo‘lsangiz, Linux’da tizim chaqiruvlari uchun ishlatiladigan uzilish identifikatori — `0x80`. Linux tizim chaqiruvlari ro‘yxatini [Maykl Kerriskning onlayn manpage](https://man7.org/linux/man-pages/man2/syscalls.2.html) katalogida o‘qishingiz mumkin.)

#### O‘rovchi (Wrapper) APIlar: uzilishlarni abstraksiyalash

Tizim chaqiruvlari haqida hozirgacha bilganlarimiz quyidagilar:

- Foydalanuvchi rejimidagi dasturlar I/O yoki xotiraga to‘g‘ridan-to‘g‘ri kira olmaydi. Tashqi dunyo bilan aloqa qilish uchun ular OT’dan yordam so‘rashlari shart.

- Dasturlar INT va IRET kabi maxsus mashina kodi buyruqlari bilan boshqaruvni OT’ga topshirishi mumkin.

- Dasturlar imtiyoz darajalarini to‘g‘ridan-to‘g‘ri o‘zgartira olmaydi; dasturiy uzilishlar xavfsizdir, chunki protsessor OT kodining aynan qaysi nuqtasiga sakrash kerakligi borasida OT tomonidan oldindan sozlab qo‘yilgan bo‘ladi. Uzilishlar vektori jadvalini esa faqat yadro rejimidan turib sozlash mumkin.

Dasturlar syscall’ni ishga tushirayotganda operatsion tizimga ma’lumotlarni uzatishi kerak; OT aynan qaysi tizim chaqiruvini bajarishni hamda syscall’ning o‘zi uchun zarur bo‘lgan ma’lumotlarni (masalan, qaysi fayl nomini ochish kerakligini) bilishi lozim. Ushbu ma’lumotlarni uzatish mexanizmi operatsion tizim va arxitekturaga qarab farq qiladi, lekin odatda bu uzilishni ishga tushirishdan oldin ma’lumotlarni ma’lum registrlarga yoki stekka (stack) joylashtirish orqali amalga oshiriladi.

Turli qurilmalarda tizim chaqiruvlarini amalga oshirish usullaridagi bunday farqlar dasturchilar uchun har bir dasturda tizim chaqiruvlarini mustaqil ravishda yozib chiqishni mutlaqo amaliyotsiz qilib qo‘ygan bo‘lar edi. Bu, shuningdek, operatsion tizimlar eski tizimga moslab yozilgan barcha dasturlarni buzib qo‘yishdan qo‘rqib, uzilishlarni qayta ishlash mexanizmini o‘zgartira olmasligini ham anglatardi. Va nihoyat, biz endi dasturlarni xom assemblerdan foydalanib yozmaymiz — dasturchilardan har safar fayl o‘qish yoki xotira ajratish kerak bo‘lganda assemblerga tushishni kutib bo‘lmaydi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-6.webp)

Shu bois, operatsion tizimlar ushbu uzilishlar ustida abstraksiya qatlamini taqdim etadi. Zarur assembler buyruqlarini o‘z ichiga olgan, qayta ishlatiladigan yuqori darajadagi kutubxona funksiyalari Unix-simon tizimlarda [libc](https://www.gnu.org/software/libc/) tomonidan, Windows’da esa [ntdll.dll](https://learn.microsoft.com/en-us/windows-hardware/drivers/kernel/libraries-and-headers) deb nomlangan kutubxonaning bir qismi sifatida taqdim etiladi. Ushbu kutubxona funksiyalarini chaqirishning o‘zi yadro rejimiga o‘tishni keltirib chiqarmaydi, ular shunchaki oddiy funksiya chaqiruvlaridir. Kutubxonalarning ichida esa assembler kodi boshqaruvni haqiqatan ham yadroga uzatadi va u o‘rab turuvchi kutubxona funksiyasiga qaraganda platformaga ancha bog‘liq bo‘ladi.

Unix-simon tizimda ishlayotgan C dasturidan `exit(1)` ni chaqirganingizda, ushbu funksiya ichki tomondan tizim chaqiruvining opkodi va argumentlarini kerakli registrlar/stek/va hokazolarga joylashtirgandan so‘ng, uzilishni ishga tushirish uchun mashina kodini bajaradi. Kompyuterlar naqadar ajoyib!

### Tezlikka ehtiyoj / Qani, CISC-lashamiz

x86-64 kabi ko‘plab [CISC](https://en.wikipedia.org/wiki/Complex_instruction_set_computer) arxitekturalari tizim chaqiruvi paradigmasining keng tarqalganligi sababli maxsus tizim chaqiruvlari uchun mo‘ljallangan buyruqlarni o‘z ichiga oladi.

Intel va AMD x86-64 borasida unchalik yaxshi kelisha olishmagan; unda aslida optimallashtirilgan tizim chaqiruvi buyruqlarining ikkita to‘plami mavjud. [SYSCALL](https://www.felixcloutier.com/x86/syscall.html) va [SYSENTER](https://www.felixcloutier.com/x86/sysenter) — bu `INT 0x80` kabi buyruqlarning optimallashtirilgan muqobillaridir. Ularga mos keluvchi qaytish buyruqlari — [SYSRET](https://www.felixcloutier.com/x86/sysret.html) va [SYSEXIT](https://www.felixcloutier.com/x86/sysexit) esa foydalanuvchi makoniga tezda qaytish va dastur kodini davom ettirish uchun mo‘ljallangan.

(AMD va Intel protsessorlari ushbu buyruqlar bilan biroz farqli moslikka ega. `SYSCALL` odatda 64-bitli dasturlar uchun eng yaxshi variant bo‘lsa, `SYSENTER` 32-bitli dasturlar bilan yaxshiroq ishlaydi.)

O‘z uslubiga sodiq qolgan holda, [RISC](https://en.wikipedia.org/wiki/Reduced_instruction_set_computer) arxitekturalarida bunday maxsus buyruqlar bo‘lmaydi. Apple Silicon asoslangan RISC arxitekturasi — AArch64 tizim chaqiruvlari uchun ham, dasturiy uzilishlar uchun ham faqat [bitta uzilish buyrug‘idan](https://support.arm.com/documentation/ddi0596/2021-12/Base-Instructions/SVC--Supervisor-Call-) foydalanadi. Menimcha, Mac foydalanuvchilari bundan hech ham nolishmayapti :)

------

#### Uh, ko‘p narsa bo‘ldi! Keling, qisqacha takrorlab olaylik:

- Protsessorlar buyruqlarni cheksiz olish-bajarish siklida bajaradi va operatsion tizimlar yoki dasturlar haqida hech qanday tushunchaga ega emas. Odatda registrda saqlanadigan protsessor rejimi qaysi buyruqlarni bajarish mumkinligini belgilaydi. Operatsion tizim kodi yadro rejimida ishlaydi va dasturlarni ishga tushirish uchun foydalanuvchi rejimiga o‘tadi.

- Binar faylni ishga tushirish uchun operatsion tizim foydalanuvchi rejimiga o‘tadi va protsessorni RAM’dagi kodning kirish nuqtasiga yo‘naltiradi. Faqat foydalanuvchi rejimi imtiyozlariga ega bo‘lganligi sababli, tashqi dunyo bilan aloqa qilishni istagan dasturlar yordam olish uchun OT kodiga sakrashi kerak. Tizim chaqiruvlari (syscalls) — dasturlarning foydalanuvchi rejimidan yadro rejimiga va OT kodiga o‘tishining standartlashtirilgan usulidir.

- Dasturlar odatda bu syscall’lardan umumiy kutubxona funksiyalarini chaqirish orqali foydalanadi. Bular boshqaruvni OT yadrosiga o‘tkazuvchi va halqalarni almashtiruvchi dasturiy uzilishlar yoki arxitekturaga xos syscall buyruqlarining mashina kodini o‘z ichiga oladi. Yadro o‘z ishini bajaradi, yana foydalanuvchi rejimiga qaytadi va boshqaruvni dastur kodiga qaytaradi.

Keling, boyagi birinchi savolimga qanday javob topishni o‘ylab ko‘raylik:

> Agar CPU bittadan ortiq jarayonni kuzatib bormasa va buyruqlarni shunchaki ketma-ket bajarsa, nega u o‘zi ishga tushirgan dastur ichida qolib ketmaydi? Qanday qilib bir vaqtning o‘zida bir nechta dastur ishlay oladi?

Buning javobi, aziz do‘stim, Coldplay guruhining bunchalik mashhurligi sababi bilan bir xil… soatlar («Clocks»)! (Xo‘sh, texnik jihatdan taymerlar. Shunchaki shu hazilni tiqishtirgim keldi.)

## 2-bob: Vaqtni bo‘laklaymiz

Aytaylik, siz operatsion tizim yaratyapsiz va foydalanuvchilar bir vaqtning o‘zida bir nechta dasturni ishga tushira olishlarini xohlaysiz. Biroq sizda zamonaviy ko‘p yadroli protsessor yo‘q, shuning uchun CPU bir vaqtning o‘zida faqat bitta buyruqni bajara oladi!

Baxtingizga, siz juda aqlli OS dasturchisisiz. Siz jarayonlarga CPU’dan navbatma-navbat foydalanish imkonini berish orqali parallellik illyuziyasini (soxta parallellikni) yaratish mumkinligini tushunib yetasiz. Agar jarayonlar bo‘ylab aylanib chiqsangiz va ularning har biridan bir nechtadan buyruqni bajarsangiz, hech bir jarayon CPU’ni yakka o‘zi egallab olmagan holda ularning barchasi tezkor javob qaytaradigan (responsive) bo‘lib turadi.

Lekin jarayonlarni almashtirish uchun boshqaruvni dastur kodidan qanday qilib qaytarib olasiz? Biroz izlanishdan so‘ng, aksariyat kompyuterlarda taymer chiplari (timer chips) mavjudligini bilib olasiz. Siz taymer chipini ma’lum bir vaqt o‘tgandan so‘ng OS’ning uzilishlarni qayta ishlovchi dasturiga (interrupt handler) o‘tishni ishga tushiradigan qilib dasturlashingiz mumkin.

### Apparat uzilishlari (Hardware Interrupts)

Avvalroq foydalanuvchi dasturidan OS’ga boshqaruvni topshirish uchun dasturiy uzilishlardan qanday foydalanilishini muhokama qilgan edik. Ular “dasturiy” uzilishlar deb ataladi, chunki ular dastur tomonidan ixtiyoriy ravishda ishga tushiriladi — odatiy olish-bajarish siklida protsessor tomonidan bajarilayotgan mashina kodi unga boshqaruvni yadroga o‘tkazishni buyuradi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-7.webp)

OS rejalashtiruvchilari (schedulers) ko‘p vazifalilik (multitasking) uchun apparat uzilishlarini ishga tushirishda [PIT](https://en.wikipedia.org/wiki/Programmable_interval_timer) (dasturlashtiriladigan interval taymerlari) kabi taymer chiplaridan foydalanadi:

1. Dastur kodiga sakrashdan oldin OS taymer chipini ma’lum bir vaqt o‘tgandan so‘ng uzilishni ishga tushiradigan qilib sozlaydi.

2. OS foydalanuvchi rejimiga o‘tadi va dasturning keyingi buyrug‘iga sakraydi.

3. Taymer vaqti tugagach, u yadro rejimiga o‘tish va OS kodiga sakrash uchun apparat uzilishini ishga tushiradi.

4. Endi OS dastur qayerda to‘xtaganini saqlab qo‘yishi, boshqa dasturni yuklashi va jarayonni takrorlashi mumkin.

Bu ustuvor siqib chiqaruvchi ko‘p vazifalilik (preemptive multitasking) deb ataladi; jarayonning majburiy to‘xtatilishi esa siqib chiqarish [preemption](https://en.wikipedia.org/wiki/Preemption_(computing)) deyiladi. Agar siz, masalan, ushbu maqolani brauzerda o‘qiyotgan va ayni shu kompyuterda musiqa tinglayotgan bo‘lsangiz, shaxsiy kompyuteringiz ehtimol soniyasiga minglab marta xuddi shu siklni bajarmoqda.

### Vaqt bo‘lagini (Timeslice) hisoblash

Vaqt bo‘lagi *timeslice* — bu OS rejalashtiruvchisi jarayonni siqib chiqarishdan oldin unga ishlash uchun ruxsat beradigan vaqt davomiyligidir. Vaqt bo‘laklarini tanlashning eng oddiy usuli — har bir jarayonga bir xil vaqt bo‘lagini, masalan, $10\text{ ms}$ atrofida berish va vazifalar bo‘ylab tartib bilan aylanib chiqishdir. Bu qat’iy vaqt bo‘lagiga asoslangan davriy rejalashtirish *fixed timeslice round-robin scheduling* deb ataladi.

> Mulohaza: qiziqarli jargon faktlar!
Vaqt bo‘laklari ko‘pincha «kvantlar» (quantums) deb atalishini bilarmidingiz? Endi bilasiz va barcha texnik do‘stlaringizni hayratda qoldirishingiz mumkin. Ushbu maqolada har ikkinchi gapda “kvant” so‘zini ishlatmaganim uchun katta maqtovga loyiqman deb o‘ylayman.
 Vaqt bo‘laklari jargonidan gap ochilgan ekan, Linux yadrosi dasturchilari qat’iy chastotali taymer tiklarini (timer ticks) sanash uchun jiffy vaqt birligidan foydalanadilar. Boshqa narsalar qatori, [jiffy](https://github.com/torvalds/linux/blob/22b8cc3e78f5448b4c5df00303817a9137cd663f/include/linux/jiffies.h)’lar vaqt bo‘laklarining uzunligini o‘lchash uchun ham ishlatiladi. Linux’ning jiffy chastotasi odatda $1000\text{ Hz}$ ni tashkil qiladi, ammo yadroni kompilyatsiya qilishda uni qayta sozlash mumkin.
 
 Qat’iy vaqt bo‘lagiga asoslangan rejalashtirishni biroz yaxshilash uchun maqsadli kechikish *(target latency)* — jarayonning javob qaytarishi uchun ideal maksimal vaqt tanlanadi. Maqsadli kechikish — bu jarayonlar soni o‘rtacha (maqbul) bo‘lgan sharoitda, siqib chiqarilgan jarayonning yana qayta bajarilishni boshlashi uchun ketadigan vaqtdir. *Buni tasavvur qilish biroz qiyin! Xavotir olmang, tez orada diagramma ham bo‘ladi.*

Vaqt bo‘laklari maqsadli kechikishni vazifalarning umumiy soniga bo‘lish orqali hisoblanadi; bu qat’iy vaqt bo‘lagiga asoslangan rejalashtirishdan yaxshiroq, chunki jarayonlar kam bo‘lganda behuda vazifa almashtirishlarning oldini oladi. Masalan, maqsadli kechikish $15\text{ ms}$ va jarayonlar soni 10 ta bo‘lsa, har bir jarayon ishlash uchun $15/10$ yoki $1.5\text{ ms}$ vaqt oladi. Agar jarayonlar soni atigi 3 ta bo‘lsa, har bir jarayon maqsadli kechikish doirasida qolgan holda uzoqroq — $5\text{ ms}$ lik vaqt bo‘lagiga ega bo‘ladi.

Jarayonlarni almashtirish hisoblash jihatidan qimmatga tushadi, chunki u joriy dasturning butun holatini saqlashni va boshqasini tiklashni talab qiladi. Ma’lum bir chegaradan o‘tgach, haddan tashqari kichik vaqt bo‘lagi jarayonlarning juda tez almashinuvi tufayli unumdorlik muammolariga olib kelishi mumkin. Shu bois vaqt bo‘lagi davomiyligiga quyi chegara (minimal donadorlik — *minimum granularity*) belgilash odatiy holdir. Bu shuni anglatadiki, minimal donadorlik kuchga kirishi uchun jarayonlar yetarlicha ko‘p bo‘lganda, maqsadli kechikish chegarasidan oshib ketiladi.

Ushbu maqola yozilayotgan vaqtda Linux rejalashtiruvchisi $6\text{ ms}$ maqsadli kechikish va $0.75\text{ ms}$ minimal donadorlikdan foydalanadi.

![cpuga-siz-ni-qoshamiz](../images/cpuga-siz-ni-qoshamiz-8.webp)

Ushbu oddiy vaqt bo‘lagi hisob-kitobiga asoslangan davriy (round-robin) rejalashtirish bugungi kunda aksariyat kompyuterlar bajaradigan ishga ancha yaqin. Biroq u baribir biroz sodda; aksariyat operatsion tizimlar jarayonlarning ustuvorligi (priorities) va muddatlarini (deadlines) hisobga oladigan murakkabroq rejalashtiruvchilarga ega. 2007-yildan beri Linux [Completely Fair Scheduler](https://docs.kernel.org/scheduler/sched-design-CFS.html) (CFS — Mutlaqo adolatli rejalashtiruvchi) deb nomlangan rejalashtiruvchidan foydalanib kelmoqda. CFS vazifalarga ustuvorlik berish va CPU vaqtini taqsimlash uchun kompyuter fanining bir talay murakkab va chiroyli usullarini qo‘llaydi.

OS har safar biror jarayonni siqib chiqarganda, u yangi dasturning saqlangan bajarilish kontekstini (execution context), shu jumladan uning xotira muhitini yuklashi kerak. Bu CPU’ga “virtual” manzillarni fizik manzillarga bog‘laydigan xarita — boshqa sahifalar jadvalidan (page table) foydalanishni buyurish orqali amalga oshiriladi. Bu, shuningdek, dasturlarning bir-birining xotirasiga kirishiga to‘sqinlik qiladigan tizim hamdir; biz ushbu maqolaning 5 va 6-boblarida aynan shu mavzuning tubiga sho‘ng‘iymiz.

### 1-eslatma: Yadroning uziluvchanligi (Kernel Preemptability)

Hozirgacha biz faqat foydalanuvchi makoni jarayonlarini siqib chiqarish va rejalashtirish haqida gaplashdik. Agar yadro kodi tizim chaqiruvini (syscall) qayta ishlashga yoki drayver kodini bajarishga juda ko‘p vaqt sarflasa, dasturlar qotib ishlayotgandek (laggy) tuyulishi mumkin.

Zamonaviy yadrolar, jumladan Linux ham, uziluvchan yadrolar ([preemptive kernels](https://en.wikipedia.org/wiki/Kernel_preemption)) hisoblanadi. Bu shuni anglatadiki, ular yadro kodining o‘zi ham xuddi foydalanuvchi jarayonlari kabi to‘xtatilishi (uzilishi) va rejalashtirilishi mumkin bo‘lgan tarzda dasturlangan.

Agar siz yadro yoki shunga o‘xshash narsa yozmayotgan bo‘lsangiz, buni bilish unchalik muhim emas, lekin men o‘qigan deyarli har bir maqolada bu haqda eslatib o‘tilgan ekan, men ham aytib o‘tishga qaror qildim! Qo‘shimcha bilim kamdan-kam hollarda zarar qiladi.

### 2-eslatma: Tarix darsi

Qadimgi operatsion tizimlar, jumladan klassik Mac OS va Windows’ning NT’dan ancha oldingi versiyalari, ustuvor siqib chiqaruvchi ko‘p vazifalilikning o‘tmishdoshidan foydalangan. OS dasturlarni qachon siqib chiqarishni hal qilish o‘rniga, dasturlarning o‘zlari OS’ga navbatni bo‘shatib berishni (yield) tanlagan. Ular «hey, endi boshqa dastur ishlashiga ruxsat berishing mumkin» deyish uchun dasturiy uzilishni ishga tushirishgan. OS boshqaruvni qaytarib olishi va navbatdagi rejalashtirilgan jarayonga o‘tishi uchun ushbu ochiq-oydin navbat bo‘shatishlar yagona yo‘l edi.

Bu kooperativ ko‘p vazifalilik ([cooperative multitasking](https://en.wikipedia.org/wiki/Cooperative_multitasking)) deb ataladi. Uning bir nechta jiddiy kamchiliklari bor: zararli yoki shunchaki yomon loyihalashtirilgan dasturlar butun operatsion tizimni osongina qotirib qo‘yishi mumkin, shuningdek, real vaqt rejimidagi yoki vaqtga sezgir vazifalar uchun vaqt izchilligini ta’minlash deyarli imkonsiz. Shu sabablarga ko‘ra, texnologiya olami allaqachon ustuvor siqib chiqaruvchi ko‘p vazifalilikka o‘tgan va ortiga qayrilib ham qaramagan.
