from fastapi import FastAPI
from pydantic import BaseModel
import oracledb as cx_Oracle
from fastapi.middleware.cors import CORSMiddleware
from datetime import date

app = FastAPI()

# frontendin bu API ye erişebilmesi için kullanılacak
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Prod ortamında daraltılabilir, şuan böyle kalsın test oldugu için
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Oracle db ye bağlantı, user: superset, password: superset123, host: 192.168.1.182, port: 1521, sid(database ismi): testdb
conn = cx_Oracle.connect("superset/superset123@192.168.1.182:1521/testdb")
cursor = conn.cursor() # SQL sorgusu için


# Gelen istekelrin veri tipi kontrolunu otomatik yapmak için
class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str

class Order(BaseModel):
    product_id: int
    quantity: int

# database de ki oluşturulan tabloya Product ekleme (SALES_PRODUCTS)
@app.post("/add-product")
def add_product(product: Product):
    cursor.execute("""
        INSERT INTO SH.SALES_PRODUCTS (ID, NAME, PRICE, DESCRIPTION)
        VALUES (:1, :2, :3, :4)
    """, (product.id, product.name, product.price, product.description))
    conn.commit()
    return {"status": "Ürün eklendi"}

# database de ki oluşturulan tabloya SIPARIS ekleme (SALES_ORDERS)
# date i otomatik oluşturuyorum
@app.post("/add-order")
def add_order(order: Order):
    today_str = date.today().strftime("%Y-%m-%d")
    cursor.execute("""
        INSERT INTO SH.SALES_ORDERS (ORDER_ID, PRODUCT_ID, QUANTITY, ORDER_DATE)
        VALUES (SH.SH_ORDER_SEQ.NEXTVAL, :1, :2, TO_DATE(:3, 'YYYY-MM-DD'))
    """, (order.product_id, order.quantity, today_str))
    conn.commit()
    return {"status": "Sipariş eklendi"}


# Bırası ürürnleri listeleme için, user ürünleri UI da görebilmesi için
@app.get("/products")
def get_products():
    cursor.execute("SELECT ID, NAME, PRICE, DESCRIPTION FROM SH.SALES_PRODUCTS")
    products = cursor.fetchall()
    return [
        {"id": row[0], "name": row[1], "price": row[2], "description": row[3]}
        for row in products
    ]
