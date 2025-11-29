# Deployment Guide

## Frontend Deployment (Netlify)

1. **Push code ke GitHub**
2. **Connect repository ke Netlify**
3. **Set Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Set Environment Variables di Netlify:**
   - Key: `VITE_SOCKET_URL`
   - Value: `https://your-backend-url.onrender.com` (dari Render backend URL)

5. **Deploy!**

## Backend Deployment (Render)

1. **Create new Web Service di Render**
2. **Connect repository**
3. **Set Build Settings:**
   - Build command: `npm install`
   - Start command: `npm run server`
   - Node version: `18`

4. **Set Environment Variables di Render:**
   - `PORT`: `3001` (atau biarkan default Render)
   - `FRONTEND_URL`: `https://your-netlify-site.netlify.app`
   - `NODE_ENV`: `production`

5. **Deploy!**

## Testing Deployment

Setelah deploy:
1. Backend akan tersedia di: `https://your-app.onrender.com`
2. Frontend akan tersedia di: `https://your-site.netlify.app`
3. Update `VITE_SOCKET_URL` di Netlify environment variables dengan backend URL
4. Redeploy frontend

## Common Issues

### "Offline - Reconnecting"
- ✅ Pastikan `VITE_SOCKET_URL` environment variable di Netlify sudah benar
- ✅ Pastikan backend Render sudah running
- ✅ Pastikan CORS di `server.ts` allow origin dari frontend URL

### Build Failed
- ✅ Delete `node_modules` dan `package-lock.json`, lalu `npm install` ulang
- ✅ Pastikan semua dependencies ada di `package.json`
- ✅ Check error logs untuk TypeScript errors
