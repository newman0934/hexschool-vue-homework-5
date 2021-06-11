const apiUrl = 'https://vue3-course-api.hexschool.io';
const apiPath = 'caesar';
const { Field, Form,ErrorMessage,defineRule,configure, extend  } = VeeValidate;
const { required, email, min, max, numeric } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('number', numeric);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');
configure({
  generateMessage: localize('zh_TW'),
});

let vm = Vue.createApp({
  data(){
    return {
      products:[],
      product:{},
      cart:{},
      order:{
        user:{
          email:"",
          name:"",
          tel:"",
          address:""
        },
        message:""
      },
      loadingStatus:{
        loadingItem : ""
      },
    }
  },
  methods:{
    async getProducts(){
      try{
        let { data } = await axios.get(`${apiUrl}/api/${apiPath}/products`)
        if(!data.success){
          throw new Error("取得產品列表失敗")
        }
        this.products = data.products
      }catch(error){
        window.alert(error.message)
      }
    },
    async getProduct(id){
      try{
        this.loadingStatus.loadingItem = id
        let { data } = await axios.get(`${apiUrl}/api/${apiPath}/product/${id}`)
        if(!data.success){
          throw new Error("取得商品資訊失敗")
        }
        this.loadingStatus.loadingItem = ""
        this.product = data.product
        this.$refs.productModal.openModal()
      }catch(error){
        window.alert(error.message)
      }
    },
    async getCarts(){
      try{
        let { data } = await axios.get(`${apiUrl}/api/${apiPath}/cart`)
        if(!data.success){
          throw new Error("取得購物車列表失敗")
        }
        this.cart = data.data
      }catch(error){
        window.alert(error.message)
      }
    },
    async addCart(id, qty = 1){
      try{
        this.loadingStatus.loadingItem = id
        let cartItem = {
          product_id: id,
          qty,
        }
        this.$refs.productModal.hideModal();
        let { data } = await axios.post(`${apiUrl}/api/${apiPath}/cart`,{ data: cartItem})
        if(!data.success){
          throw new Error("加入購物車失敗")
        }
        this.loadingStatus.loadingItem = ""
        this.getCarts()
      }catch(error){
        window.alert(error.message)
      }
    },
    async deleteCarts(){
      try{
        let { data } = await axios.delete(`${apiUrl}/api/${apiPath}/carts`)
        if(!data.success){
          throw new Error("清空購物車失敗")
        }
        this.getCarts()
      }catch(error){
        window.alert(error.message)
      }
    },
    async deleteCartItem(id){
      try {
        this.loadingStatus.loadingItem = id
        let { data } = await axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
        if(!data.success){
          throw new Error("刪除購物車商品失敗")
        }
        this.loadingStatus.loadingItem = ""
        this.getCarts()

      }catch(error){
        window.alert(error.message)
      }
    },
    async updateCartQty(item){
      try {
        this.loadingStatus.loadingItem = item.id
        let cartItem = {
          product_id:item.product_id,
          qty:item.qty
        }
        let { data } = await axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`,{data: cartItem})
        if(!data.success){
          throw new Error("更改購物車商品數量失敗")
        }
        this.loadingStatus.loadingItem = ""
        this.getCarts()
      }catch(error){
        window.alert(error.message)
      }
    },
    async addOder(){
      try {
        let order = this.order
        let { data } = await axios.post(`${apiUrl}/api/${apiPath}/order`, {data:order})
        if(!data.success){
          throw new Error("送出訂單失敗")
        }
        // this.$refs.form.resetForm();
        this.getCarts()
      }catch(error){
        window.alert(error.message)
      }
    }
  },
  created(){
    this.getProducts()
    this.getCarts()
  },
})

vm.component("product-modal",{
  template:"#userProductModal",
  props:{
    product:{
      type:Object,
      default(){
        return {}
      },
    }
  },
  data(){
    return {
      modal:"",
      qty:1
    }
  },
  mounted(){
    this.modal = new bootstrap.Modal(this.$refs.modal, {
      keyboard: false,
      backdrop: 'static'
    });
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    hideModal() {
      this.modal.hide();
    },
    btnHandler(){
      this.$emit("add-cart",this.product.id, this.qty)
    }
  },
})
vm.component("v-form",Form)
vm.component("v-field",Field)
vm.component("error-message",ErrorMessage)

vm.mount("#app")