import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from 'webpack'

const { NormalModuleReplacementPlugin } = pkg
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        compress: true,
        port: 9000,
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Shinkom Demo',
            template: 'src/index.html'
        }),
        new NormalModuleReplacementPlugin(
            /^node:/,
            (resource) => {
                resource.request = resource.request.replace(/^node:/, '');
            },
        ),
    ],
    optimization: {
        runtimeChunk: 'single'
    },
    externals: {
        "node:fs": "commonjs node:fs",
        "node:path": "commonjs node:path",
        "node:url": "commonjs node:url"
    },
    resolve: {
        fallback: {
            fs: false,
            url: false,
            path: false
        }
    },
    experiments: {
        asyncWebAssembly: true
    }
};