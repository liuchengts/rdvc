import * as zlib from "zlib";

interface GZipService {
    deflate(input: string, callback: Function): void

    inflate(input: string, callback: Function): void
}

class GZipServiceImpl implements GZipService {
    deflate(input: string, callback: Function) {
        console.log("deflate input",input.length)
        zlib.deflate(input, (er, deflate_buf) => {
            if (er) {
                console.error("deflate失败", er)
            }
            console.log("deflate_buf",deflate_buf.length)
            callback(deflate_buf.toString())
        });
    }

    inflate(input: string, callback: Function) {
        zlib.inflate(input, (er, inflat_buf) => {
            if (er) {
                console.error("deflate失败", er)
            }
            callback(inflat_buf.toString())
        });
    }

}

export const gZipService = new GZipServiceImpl()