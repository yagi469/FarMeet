import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    // 1. 公開時のURLパス (https://~.github.io/FarMeet/react/)
    base: '/FarMeet/react/',

    build: {
        // 2. ビルド出力先を、公開用フォルダ(docs/react)に指定
        //    現在は FarMeet/react/ にいるので、 ../docs/react を指定
        outDir: '../docs/react',

        // 3. ビルド時に古いファイルを削除して空にする
        emptyOutDir: true,
    }
})
