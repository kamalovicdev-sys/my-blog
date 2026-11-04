# Blogga post yozish

Bu papka (`content/`) Obsidian vault sifatida ochiladi: Obsidian → **Open folder as vault** → `my-blog/content`.

## Yangi post

1. `posts/` papkasida yangi qayd yarating va unga odatdagidek nom bering, masalan `Docker o'rnatish`. Post manzili nomdan avtomatik yasaladi: `/posts/docker-ornatish`
2. `Ctrl+P` → **Templates: Insert template** → `post`
3. Yozing. Post tayyor bo'lgach `draft`ni o'chiring (`false`)

Shablonsiz, ya'ni frontmatter'siz fayl post hisoblanmaydi va saytda ko'rinmaydi.

## Maydonlar

| Maydon | Majburiy | Izoh |
|---|---|---|
| `date` | ha | `2026-10-30` ko'rinishida. Shablon o'zi qo'yadi. Kelajak sana qo'yilsa (va `draft: false`), post o'sha kuni Toshkent vaqti bilan yarim tundan keyin o'zi saytga chiqadi |
| `title` | yo'q | Bo'sh qolsa, qayd nomi sarlavha bo'ladi |
| `description` | yo'q | Bosh sahifa va Telegram preview uchun. Bo'sh qolsa, matnning birinchi paragraflaridan olinadi |
| `tags` | yo'q | Masalan: `linux`, `python` |
| `cover` | yo'q | Bosh sahifadagi kichik rasm va Telegram preview rasmi. Bo'sh qolsa, matndagi birinchi rasm olinadi |
| `draft` | yo'q | `true` bo'lsa, post faqat kompyuteringizda (`npm run dev`) ko'rinadi, saytga chiqmaydi |
| `slug` | yo'q | Manzilni qo'lda berish uchun: `slug: docker` → `/posts/docker` |

## Rasmlar

Rasmni nusxalab postga joylashtiring (`Ctrl+V`). Obsidian uni `images/` papkasiga saqlaydi, saytda ham o'zi ko'rinadi.
Boshqa saytdagi rasmga havola bermang, ular vaqt o'tib o'chib ketishi yoki bloklanishi mumkin. Rasmni yuklab olib, postga joylashtiring.

## Yozish qoidalari

- Sarlavhalar uchun `#`, `##`, `###` ishlataverasiz. Saytda ular avtomatik to'g'ri darajaga keltiriladi
- Paragraflar orasiga bitta bo'sh qator kifoya, `<br>` kerak emas
- Kod uchun tilni ko'rsating: ` ```python `
- Formula: `$E = mc^2$` yoki alohida qatorda `$$ ... $$`

## E'lon qilish

```bash
git add content
git commit -m "Yangi post: ..."
git push
```

Netlify saytni avtomatik yangilaydi.
