import * as zlib from "zlib";

interface GZipService {
    deflate(input: string, callback: Function): void

    inflate(input: string, callback: Function): void
}

class GZipServiceImpl implements GZipService {
    deflate(input: string, callback: Function) {
        zlib.deflate(input, (er, deflate_buf) => {
            if (er || deflate_buf == null) {
                console.error("deflate失败", er)
                return
            }
            callback(deflate_buf.toString())
        });
    }

    inflate(input: string, callback: Function) {
        zlib.inflate(input, (er, inflat_buf) => {
            if (er || inflat_buf == null) {
                console.error("inflate失败", er)
                return
            }
            callback(inflat_buf.toString())
        });
    }

}

export const gZipService = new GZipServiceImpl()