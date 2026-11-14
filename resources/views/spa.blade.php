<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        <title>SisaPiring | Penyelamat Kuliner UMKM (Konsumen, Mitra UMKM & Admin)</title>
        <meta name="description" content="Platform penyelamatan makanan sisa piring UMKM: Marketplace Konsumen, Portal Mitra Bisnis Bandung, dan Pusat Tata Kelola Admin.">
        <meta property="og:title" content="SisaPiring — Penyelamat Kuliner UMKM">
        <meta property="og:description" content="Platform penyelamatan makanan sisa piring UMKM: Marketplace Konsumen, Portal Mitra Bisnis Bandung, dan Pusat Tata Kelola Admin.">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite('src/main.tsx')
    </head>
    <body class="bg-[#FAF9F6] text-stone-900 antialiased selection:bg-emerald-900 selection:text-white">
        <div id="root"></div>
    </body>
</html>
