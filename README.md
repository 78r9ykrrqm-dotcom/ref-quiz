# חוקת הכדורגל — תרגול לשופטים

אפליקציית Next.js בעברית לתרגול שאלות אמריקאיות לשופטי כדורגל בישראל.

## הרצה מקומית

```bash
npm install
npm run dev
```

ואז לפתוח בדפדפן:

```bash
http://localhost:3000
```

## בנייה לפרודקשן

```bash
npm run build
npm run start
```

## פריסה ל־Vercel

### אפשרות א׳ — דרך GitHub + Vercel

1. להעלות את הפרויקט ל־GitHub.
2. להיכנס ל־Vercel.
3. לבחור New Project.
4. לייבא את הריפו מ־GitHub.
5. ללחוץ Deploy.
6. לקבל לינק ציבורי מסוג `https://project-name.vercel.app`.

### אפשרות ב׳ — דרך Vercel CLI

1. להתקין:
   ```bash
   npm i -g vercel
   ```
2. להריץ מתוך תיקיית הפרויקט:
   ```bash
   vercel
   ```
3. לפריסה לפרודקשן:
   ```bash
   vercel --prod
   ```
