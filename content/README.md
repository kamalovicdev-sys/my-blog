# Blogga post yozish

Bu papka (`content/`) Obsidian vault sifatida ochiladi: Obsidian → **Open folder as vault** → `my-blog/content`.

## Yangi post

1. `posts/` papkasida yangi fayl yarating. **Fayl nomi = post manzili**, shuning uchun kichik harf va chiziqcha ishlating: `docker-ornatish.md` → `/posts/docker-ornatish`
2. `Ctrl+P` → **Templates: Insert template** → `post`
3. `title`ni to'ldiring. Bo'sh qolsa, fayl nomi sarlavha bo'ladi
4. `description` ixtiyoriy. Bo'sh qolsa, matnning birinchi paragraflaridan olinadi

## Rasmlar

Rasmni nusxalab postga joylashtiring (`Ctrl+V`). Obsidian uni `images/` papkasiga saqlaydi, saytda ham o'zi ko'rinadi.
Postdagi birinchi rasm bosh sahifadagi kartochkada va Telegram preview'da chiqadi.

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
