##1.sudoでパスが通らない場合
    /etc/sudoers

    Defaults    env_reset
    
    を
    
    Defaults    env_keep += "PATH"

    コメントアウト
    #Defaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin
    
##2.Build-essential
### まずは基本的な物をインストール
    > sudo apt-get update
    > sudo apt-get install build-essential
    > sudo apt-get install python 
##USER追加
    > adduser USER
###USERをGROUPに追加      
    > gpasswd -a USER GROUP
###GROUPを追加   
    > groupadd GROUP
###GROUPを確認  
    > groups USER
###sudoer
    > adduser USER
    > gpasswd -a USER sudo    
##依存する物...
    node.js - プラットフォーム
    mongodb - メインストレージ           
## Node.jsインストール
### Ubuntu/Mac    
    まず、nodebrewをインストール
        
    > curl -L git.io/nodebrew | perl - setup
    > export PATH=$HOME/.nodebrew/current/bin:$PATH
        
    nodeをインストール
        
    > nodebrew install-binary v6.X.0
    > nodebrew use v6.X.0
        
####npmのパーミッションを設定(必ず)

    ”sudo npm install xxx"だとうまくいかない場合があるので、npmのパーミッション変えて"npm install xxx"するための設定。
    (https://docs.npmjs.com/getting-started/fixing-npm-permissions)
   
   
    ホームディレクトリにnpmディレクトリ作る。
    
    > mkdir ~/.npm-global
    
    
    npmの設定
    
    > npm config set prefix '~/.npm-global'
        
        
    パス追加（~/.profile）
    
    > export PATH=~/.npm-global/bin:$PATH    
    > source ~/.profile
      
##Windows
    see http://qiita.com/takuyakojima/items/780b3b3133a17cceb175

##mongodbインストール
###Ubuntu
    > sudo apt install mongodb
    > sudo apt install mongo-tools
###Mac(Homebrew)
    > brew install mongodb
###Windows

    see http://qiita.com/moto_pipedo/items/c3bb40370ba2792143ad
    
###設定

####外部からの操作禁止

    > cd /etc
    > sudo nano mongod.conf
   
    で
   
    bindIp: 127.0.0.1
    
    を
 
    bindIp: 0.0.0.0
      
    > sudo service mongod restart  
    
    
####セキュリティON    
    
    > cd /etc
    > sudo nano mongod.conf
       
    追記
       
    auth = true
    
     > sudo service mongod restart

####起動スクリプト

    /etc/init.d/mongodb
    
####起動コマンド    

    > sudo service mongodb stop
    > sudo service mongodb start
    > sudo service mongodb restart
    
####初期化
    
#####DB全体の認証
    
    $ mongo
    > use admin
    > db.createUser({user: "admin",pwd: "zz0101",roles:[{role: "userAdminAnyDatabase",db: "admin"}]})
    
#####個々のDBの認証(auth-dbはtarget-db自体)
    
    > use shop0
    > db.createUser({user:"webshopmaster", pwd:"Nipp0nbashi7", roles:[ "readWrite", "dbOwner" ]})

#####Index

    > db.fs.files.createIndex({ "filename" : 1, "uploadDate" : 1 })

####ログ
##### Ubuntu

    /var/log/mongodb
    rm mongo.log.2016*
    
##### Mac

    /usr/local/var/log/mongodb
    rm mongo.log.2016*
    
####Tips
#####クエリーロギング

    スタート
    db.setProfilingLevel(1,20)
    ストップ
    db.setProfilingLevel(0)

#####mongodbたまに実行

    $ mongo
    > use admin
    > db.runCommand( { logRotate : 1 } )
    
#####localでmongoをcsvで落とす方法（例）
    mongoexport --host=127.0.0.1  --db test2 --collection businesscards --out businesscard.csv  --type=csv --fields=Template,UpdateDate

#####メモリー使用量
    /proc/**PID**/statusのVmRSS

##pm2インストール
    see http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

    > sudo npm install pm2 -g
    > sudo pm2 startup ubuntu
###Use  
    > sudo pm2 start start.json --env production
    > sudo pm2 save
###Test  
    > sudo reboot
      .
      .
      .
    > sudo pm2 list
###メモリー（GC) 
    > sudo pm2 start app.js --node-args="--optimize_for_size --max_old_space_size=920 --gc_interval=100"       
###Cluster

    cluster.json(例)
    
        {
          "apps" : [
          {
            "name"        : "app",
            "script"      : "app.js",
            "instances"  : 2,
            "exec_mode"  : "cluster_mode",
            "args"        : [],
            "node_args"   : "--optimize_for_size --max_old_space_size=720 --gc_interval=100",
            "env": {
              "NODE_ENV": "development"
            },
            "env_production" : {
              "NODE_ENV": "production"
            }
          }
          ]
        }

    > sudo pm2 start cluster.json --env production
    
#linuxエトセトラ

##ディレクトリ
#####中身ごと削除
    rm -R DIRECTORY
##プロセス
#####確認
    ps -elf
##シンボリックリンク(ショートカットっぽいの)    
#####作成
    ln -s

##ドメイン(Nginx)

####最新版インストール

    /etc/apt/sources.listに追記

    deb http://nginx.org/packages/ubuntu/ trusty nginx
    
    「trusty」てのはでDebian系のバージョン表記なんだって。
    なので、適宜変えてね。
    
    apt-get update
    
    sudo service nginx stop
    
    sudo apt-get remove nginx-common
    
    sudo apt-get install nginx
    
    sudo service nginx start
    
#####ディレクトリ
      cd /etc/nginx
#####存在すべきサイトとして登録
      cd sites-aveilable
      cp default xxx.vvv.jp.conf
#####編集
      sudo nano xxx.vvv.jp.conf

      server {
              client_max_body_size 50M;
              listen        80;
              server_name   ドメイン(xxx.netなど);
              #return 301   https://$host$request_uri;
              #access_log   logs/host.access.log  main
      
              location / {
                        proxy_buffering off;
                        proxy_pass アドレス(http://128.199.232.217:20000など)
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "upgrade";
                        proxy_redirect http:// https://;
                        }
              }
              
      Let's EncryptでHTTPSならば        
              
      server {
              client_max_body_size 50M;
              listen 443 ssl;
              
              (nginxが1.9.6以上ならば)
              
              listen 443 ssl http2;
              
              server_name ドメイン(xxx.netなど);
              ssl_certificate      /etc/letsencrypt/live/[ファイル名確認]/fullchain.pe$
              ssl_certificate_key  /etc/letsencrypt/live/[ファイル名確認]/privkey.pem;
      
              #access_log  logs/host.access.log  main;
      
              location / {
                  proxy_buffering off;
                  proxy_pass http://localhost:30000;
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection "upgrade";
              }
      }        
      
      cd ../sites-enabled
      ln -s ../sites-aveilable/xxxxx . 


####開始/終了/再起動

    終了
    sudo service nginx stop

    開始
    sudo service nginx start

    再起動
    sudo service nginx configtest


####MacOS(Homebrew)

    /usr/local/etc/nginx/nginx.conf

    終了
    nginx -s stop

    再起動
    nginx -s reload

    localhost:8080/,,,,,,

##Backup

####full backup
    
    3.0 以前
    // > sudo service mongodb stop
    // > sudo mongodump --dbpath /var/lib/mongo
    
    
    3.0以降
    > sudo mongodump --authenticationDatabase admin -u oda -p zz0101


####full restore
    
    3.0 以前
    // > sudo service mongodb stop
    // > sudo mongorestore --dbpath /var/lib/mongo dump

    3.0以降

    フルリストアは不明。
    
####buckup
    
    3.0以降 
    > mongodump --authenticationDatabase **AUTH-DBNAME** -u **DBUSER** -p **DBPASS** -d **TARGET-DBNAME** -o "**OUTPUT-PATH**"  
    
####restore


    3.0以降
    
    > use **TARGET-DBNAME**
    > db.createUser({user:"**DBUSER**", pwd:"**DBPASS**", roles:[ "readWrite", "dbOwner" ]})

    で対象ユーザ作成後,
    
    > mongorestore --authenticationDatabase **AUTH-DBNAME** -u **DBUSER** -p **DBPASS** -d **TARGET-DBNAME** "**OUTPUT-PATH**"

####Zip

    zip -r dump.zip dump
    
####SCP
    
     scp dump.zip XXX.XXX.XXX.XXX:/path/to/dist

####sudo
    
    pathを引き継ぐ。(digital ocean, etc..)
    
    Defaults    env_reset
    #Defaults   secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    Defaults    env_keep += "PATH"
     
####mail

    sudo saslpasswd2 -u seventh-code.com -c oda
        
##Mecab ユーザ辞書

     mac(homebrew)

     /usr/local/Cellar/mecab/0.996/libexec/mecab/mecab-dict-index  -d /usr/local/lib/mecab/dic/ipadic -u /usr/local/lib/mecab/dic/userdic/music.dic -f utf-8 -t utf-8 mecab_music_dic.csv

     /usr/local/etc/mecabrc

     ubuntu(apt-get)

     /usr/lib/mecab/mecab-dict-index                               -d /usr/share/mecab/dic/ipadic     -u /var/lib/mecab/dic/music.dic               -f utf-8 -t utf-8 mecab_music_dic.csv

     sudo nano /etc/mecabrc

####GMail

    セキュリティ
    
    https://myaccount.google.com/u/1/security
    
    安全性の低いアプリの許可: 有効とする
    
####Let's Encrypt（HTTPSの認証)

    ここ見ろ
    
    https://letsencrypt.jp/usage/
        
    まず、certbot-autoってのをインストール
    
    > cd ~
    > mkdir certbot
    > cd certbot
    > wget https://dl.eff.org/certbot-auto
    > chmod a+x certbot-auto
    > sudo service nginx stop
    > ./certbot-auto
        エラー出たら
    > ./certbot-auto certonly
    > sudo service nginx start



    実行
    
    > cd ~
    > cd cartbot
    > sudo service nginx stop
    > ./certbot-auto certonly --no-self-upgrade -n --standalone  --agree-tos --email oda.mikio@gmail.com -d www.aaa.com
    > sudo service nginx start
    
    -nginxってのが使える？使うと楽？

;
    複数

    > cd ~
    > cd certbot
    > sudo ./certbot-auto certonly --nginx -d broad-e.co.jp -d www.broad-e.co.jp

    更新
    
    > cd ~
    > cd certbot
    > sudo service nginx stop
    > sudo ./certbot-auto renew -q --no-self-upgrade
    > sudo service nginx start
    
    証明書の取得時に使用したオプションは
    
    /etc/letsencrypt/renewal/${DOMAIN}.conf
   
##openssl
   
    作るもの
   
    秘密鍵
    公開鍵
    証明書
   
####秘密鍵
   
    openssl genrsa -aes128 1024 > server.key
   
####公開鍵
 
    openssl req -new -key server.key > server.csr   

####証明書

    openssl x509 -in server.csr -days 365 -req -signkey server.key > server.crt
   
####npmのパーミッション

    ”sudo npm install xxx"だとうまくいかない場合は、npmのパーミッション変えて"npm install xxx"。

    https://docs.npmjs.com/getting-started/fixing-npm-permissions
   
   
    ホームディレクトリにnpmディレクトリ作る。
    
        > mkdir ~/.npm-global
    
    npmの設定
    
        > npm config set prefix '~/.npm-global'
        
    パス追加（~/.profile）
    
        > export PATH=~/.npm-global/bin:$PATH    
        > source ~/.profile
   
   
####監査

    npmモジュール監査
    
        > npm audit
        
        
####npmモジュールバージョン

    npmモジュールバージョン
    
        > npm install -g npm-check-updates        
   
   
    確認
    
        > ncu 
        
        
    更新
        
        > ncu -u
        
        
    メジャーバージョン固定
        
        > ncu --semverLevel major
   
   
# 独り言

## Angular2 + Node.js

###angular-cliでなんかつくる
    そこのディレクトリで
        npm install express --save
        npm install cookie-parser body-parser morgan --save
        
###srcディレクトリにapp.jsつくる。
    
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        
        var app = express();
        
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(__dirname));
        
        app.get('/*', function (req, res) {
          res.sendFile(path.join(__dirname,'index.html'));
        });
        
        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });
        
        
        if (app.get('env') == "development")
        {
          app.listen(3000, function () {
            console.log('Example listening on port 3000!');
          });
        }
        else{
          app.listen(8080, function () {
            console.log('Example listening on port 8080!');
          });
        }
        
        module.exports = app;

    
###iOSのBase64 Tips
                     
      NSData通るとなぜか"+"が" "になってるんです。
      逆変換するべし。。。？？？
      なんかあるんやろな。。
      こんなかんじ。  
      
      let data1 = data0.replace( / /g , "+" );
     
##心がけよう

    シンプルに。
    迷う時はシンプルな方に。
    ソフトウェアの最大の敵は複雑性。ソフトウェア工学は複雑性と戦うための武器。野獣を閉じ込めろ。制御された複雑性。
    複雑性とは関連する物とその関連性の数。よって複雑性は増殖する。
    まずは名前が大事。
    名前は「世界観」と「構造」による推測を大事に。
    各種のモジュールやら変数やらの名前が決まったら、半分くらいはできたようなもん。
    ソースのサイズは複雑さに非らず。長くてもシンプルに。
    長い処理はダメだけど、短い処理が絡まってるのもダメ。メリハリ、バランス。(例えるなら一つの章に会話一回なんて小説、ただのアバンギャルド...)
    変数名は可能な限りフルスペル。スペルの省略には個性が入り混じってしまう。コピペ多用すべし。
    コピペも満足にできないようなのは"エディタ"じゃない。それはなんか苦行強いる宗教の類。。。
    「俺のソースは短いよ！かっこいいだろ！」は、ホビイスト坊や。
    「複雑なアルゴリズム」を「単純なコード」に還元する。
    「複雑なアルゴリズム」を「それ以上に複雑なコード」にしてはならない。
    「アルゴリズム＋データ構造＝プログラム」だが1+99や99+1は複雑性のピークが高い。50+50を心がける。
    ソースが表現の全て。可能な限りソースで処理を表現すべし。
    可能な限り処理自体にヒントを埋め込め。それを冗長とは言わない。
    コメントよりヒント。ソースで表現できない部分のみ文章で補う。
    言語固有の変な書き方はやめよう。まずは言語間の移植性(移植しないにせよ)、次に言語設計者の意図、次にシンプルさ。
    移植性が高いものほど論理的に強い。
    コピペ最強。なんせキーボード打つより間違わない。可能な部分は可能な限り。コピペは義務。
    フルスペルの長い名前をコピペすべし。名前を短縮しない。
    起動時、初期化時に可能な限りの処理を“試用”すべし。立ち上がりさえすれば論理的に正しい可能性が大きい。
    何かが少しでもおかしい場合は大騒ぎするように。異常を隠すのは無意識でも罪。
    「遅い、早い、大きい、小さい」は相対評価。「効率がいい、悪い」がより本質的。
    最適なアルゴリズムを採用すれば、シンプルになる。複雑だと感じたら基本から考え直そう。
    ソフトウェアの「技術力」とは複雑性をいかに克服できるかの度合い。複雑さの「達成」度合いではない。
    自分のソースに縛られない。歪みがあれば最初からやり直せ。
    人間、焦ると力押しに走る。それが終わりの始まり。
    他に何か理由があるでもなく、１度しか使わないような”関数”は展開しよう。関数にすることで複雑性を上げるだけ。

    伽藍がなければバザールもできない。
    バザールの商人よりも、良い建築家を目指せ。
    
#### "a || b"パターンの使用は控えよう。

    完全にJavaScriptに閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    平たく書けば

        let result = HOGE || PIYO;

    は

        let result = HOGE;
        if (!HOGE) {
            result = PIYO;
        }

    なんら条件分岐が減るわけでもなく、単純にタイピング量wが減るだけ。。
    "a"がfalsyなら"b"って...
    たくさーん連結すればなんかいいこともあるかな？
    最後のtrueまで評価なんだろうな。。知らんけど。
    なんかなあ。。。
    
    ソースのサイズは複雑さに非らず。
    キーボード打つのがそんな嫌いなら、この商売向いてないよ？
    
#### "!!"パターンの使用もあかん。

    これも完全に形無し言語に閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    ちゃんと"Boolean()"しよう。それだけ。
    

####パターン・イディオムは無理やり使わない

    適応できない部分はあっさり諦めよう。
    パターンを変化させればもはやそれはパターンではない。


####TypeScriptの"this"は罠あり

    Mongooseで

    HogeSchema.static("hogeFunc", ():void => {

      this.....

    });

  と

    HogeSchema.static("hogeFunc", function():void {

      this.....

    });


    だと、下はthisが暗黙で_thisになるため、うまくない。
    thisあれば素直にfunctionかな。
    JavaScriptはつくづくかっこ悪い言語。
   
####いつか使う
     
  node-config
  
        すぐにもできるけども。。。
        
        https://github.com/lorenwest/node-config
              
              
  WebDriver
  
        インストール(Mac Homebrew)
        
        brew install selenium-server-standalone
        brew install chromedriver

        起動(Mac Homebrew)
        
        java -Dwebdriver.chrome.driver=/usr/local/bin/chromedriver -jar /usr/local/Cellar/selenium-server-standalone/3.6.0/libexec/selenium-server-standalone-3.6.0.jar

  GraphQL
  
        あんまり好きくない感じ。。。
        サーバ・クライアント間で型安全。
        
       
  ECMAScript パーサー
    
        http://esprima.org/
        
  ジェネレータ
        
        https://github.com/estools/escodegen
        
  Parser API
        
        https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Expressions
        
        
  chromeサービスワーカー
   
        止める
             
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            // 登録されているworkerを全て削除する
            for(let registration of registrations) {
                registration.unregister();
            }
        });
        caches.keys().then(function(keys) {
            var promises = [];
            // キャッシュストレージを全て削除する
            keys.forEach(function(cacheName) {
                if (cacheName) {
                    promises.push(caches.delete(cacheName));
                }
            });
        });
        
  Google Map API Key
   
        https://developers.google.com/maps/web/

