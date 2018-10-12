"use strict";

const assert = require('assert');

const Cipher: any = require("../server/systems/common/cipher").Cipher;

describe('Cipher', () => {

    it("FixedDecrypt suc", () => {
        let plain = "hoge";
        let pass = "aaaa";
        let c = Cipher.FixedCrypt(plain, pass);
        let d = Cipher.FixedDecrypt(c, pass);
        assert.strictEqual(d, plain);
    });

    it("FixedDecrypt fail", () => {
        let plain = "hoge";
        let pass1 = "aaaa";
        let pass2 = "aaaa1";
        let c = Cipher.FixedCrypt(plain, pass1);
        let d = Cipher.FixedDecrypt(c, pass2);
        assert.notStrictEqual(d, plain);
    });

    interface Decoded {
        status: string,
        plaintext: string,
        signeture: string
    }

    interface Encoded {
        status: string,
        cipher: string
    }

    let btoa = (str) => {
        return decodeURIComponent(str);
    };

    let atob = (str) => {
        return encodeURIComponent(str);
    };

    it("PublicKey suc", () => {
        let plain = "日本国民は、正当に選挙された国会における代表者を通じて行動し、われらとわれらの子孫のために、諸国民との協和による成果と、わが国全土にわたつて自由のもたらす恵沢を確保し、政府の行為によつて再び戦争の惨禍が起ることのないやうにすることを決意し、ここに主権が国民に存することを宣言し、この憲法を確定する。" +
            "そもそも国政は、国民の厳粛な信託によるものであつて、その権威は国民に由来し、その権力は国民の代表者がこれを行使し、その福利は国民がこれを享受する。" +
            "これは人類普遍の原理であり、この憲法は、かかる原理に基くものである。" +
            "われらは、これに反する一切の憲法、法令及び詔勅を排除する。\n" +
            "日本国民は、恒久の平和を念願し、人間相互の関係を支配する崇高な理想を深く自覚するのであつて、平和を愛する諸国民の公正と信義に信頼して、われらの安全と生存を保持しようと決意した。" +
            "われらは、平和を維持し、専制と隷従、圧迫と偏狭を地上から永遠に除去しようと努めてゐる国際社会において、名誉ある地位を占めたいと思ふ。" +
            "われらは、全世界の国民が、ひとしく恐怖と欠乏から免かれ、平和のうちに生存する権利を有することを確認する。\n" +
            "われらは、いづれの国家も、自国のことのみに専念して他国を無視してはならないのであつて、政治道徳の法則は、普遍的なものであり、この法則に従ふことは、自国の主権を維持し、他国と対等関係に立たうとする各国の責務であると信ずる。\n" +
            "日本国民は、国家の名誉にかけ、全力をあげてこの崇高な理想と目的を達成することを誓ふ。";

        let pass = "日本国憲法";

        let plain_url_encoded = atob(plain);
        let pk: string = Cipher.PublicKey(pass);
        let c: Encoded = Cipher.PublicKeyEncrypt(pk, plain_url_encoded);
        let d: Decoded = Cipher.PublicKeyDecrypt(pass, c.cipher);
        let plain_url_decoded = btoa(d.plaintext);

        assert.strictEqual(plain_url_decoded, plain);
    });

});

const IPV6: any = require("../server/systems/common/ipv6").IPV6;

describe('IPV6', () => {

    it("V4 suc", () => {
        let v6 = IPV6.ToIPV6("192.168.0.1");
        assert.strictEqual(v6,"::ffff:192.168.0.1");
    });

    it("V6 suc", () => {
        let v6 = IPV6.ToIPV6("2001:db8:85a3::8a2e:370:7334");
        assert.strictEqual(v6,"2001:db8:85a3::8a2e:370:7334");
    });

    it("brokenV4-1", () => {
        let brokenv4 = IPV6.ToIPV6("192.168.1");
        assert.strictEqual(brokenv4,"::ffff:0.0.0.0");
    });
    it("brokenV4-2", () => {
        let brokenv4 = IPV6.ToIPV6("260.168.100.1");
        assert.strictEqual(brokenv4,"::ffff:0.0.0.0");
    });

    it("hoge", () => {
        let hoge = IPV6.ToIPV6("jhygbcdbjsdb");
        assert.strictEqual(hoge,"::ffff:0.0.0.0");
    });

    it("V6", () => {
        let v6 = IPV6.ToIPV6("::ffff:0.0.0.0");
        assert.strictEqual(v6,"::ffff:0.0.0.0");
    });

});

