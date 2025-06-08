
### STEP 1

- sanal makineyi ayağa kaldır. (VM Box)
- MobaXTerm ile sanal makinaya bağlan
          - oracle kullanıcısı ile gir
          - lsnrctl start (listener başlat)
          - sqlplus / as sysdba (oracle database e bağlan)
          - startup (database ayağa kaldır)

### STEP 2

- DBevaer dan 2 tane table oluştur. Ben SH da oluşturdum
          - SALES_PRODUCTS -> ürünleri tutmak için
          - SALES_ORDERS -> siparişleri tutmak için


### STEP 3

- Superseti açmak:
          - MobaXterm root ile giriş yap. (superseti hangi kullanıcıya kurduysan)
          - systemctl start superset (superseti başlat)
          - systemctl status superset (superset bağlantı adresini kopyala)
  
- Siparişleri canlı takip etmek için,
          - Oluşturduğun SALES_ORDERS tablosu ile chart oluştur. (uygulamada her sipariş verildiğinde tablo güncellenicek)


### STEP 4

- uygulamayı başlatma:

backend de venv dosyasını oluştur, requirementsleri oraya yükle !!!

```bash
  cd backend
  python -m venv venv 
```

venv i aktive et (windows)
```bash
  venv\Scripts\activate
```
run

```bash
  uvicorn main:app --reload
```

client

```bash
  cd client
  npm run dev 
```



Şuan sisteme ürün ekleme, sipariş verme ve siparişleri supersette monitörleme yapılıyor


!!! NOTES
Database de kayıtlı olan siparişleri front da gösteremedim.
siparişleri time stampı suan sadece tarihi tutuyor, saat, dakika eklenebilir.


---

### Overview










    
