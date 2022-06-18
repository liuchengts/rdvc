// @ts-ignore
import {ImagePool} from '@squoosh/lib';
import {cpus} from 'os';

//https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/index.ts
export type EncodeResult = {
    optionsUsed: object;
    binary: Uint8Array;
    extension: string;
    size: number;
}

interface CompressionService {
    /**
     * 压缩图片并编码
     * @param input 原始图片buffer
     * @param quality 压缩比
     * @param width 压缩的宽度
     * @param height 压缩的高度
     */
    compImg(input: Buffer, quality: number, width?: number, height?: number): Promise<EncodeResult>
}

class CompressionServiceImpl implements CompressionService {
    /**
     * 接受压缩图像的管道，如果关闭，将无法再调用 ingestImage 传递图像
     */
        // private imagePool = new ImagePool(cpus().length);
    private imagePool = new ImagePool(1);

    async compImg(input: Buffer, quality: number, width?: number, height?: number): Promise<EncodeResult> {
        let image = this.imagePool.ingestImage(input.buffer);
        let preprocessOptions = {}
        if (width != null && height != null) {
            preprocessOptions = {
                resize: {
                    width: width,
                    height: height,
                }
            }
        }
        await image.preprocess(preprocessOptions);
        await image.encode({
            mozjpeg: {
                quality: quality
            }
        })
        return image.encodedWith.mozjpeg
    }
}

export const compressionService = new CompressionServiceImpl()