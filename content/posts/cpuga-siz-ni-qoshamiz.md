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

> Chekinish: Buyruqlar mashina kodida har doim ham yuqoridagi misoldagidek 1:1 nisbatda ifodalanavermaydi. Masalan, `add eax, 512` buyrug‘i `05 00 02 00 00` ko‘rinishiga o‘giriladi.
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

> Chekinish: aytgancha, yadro (kernel) nima o‘zi?
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
