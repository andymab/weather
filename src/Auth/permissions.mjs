// import { computed } from "vue";

// userMixin.js
export default {
  computed: {
    Auth(){
      return this.$store.getters.getUser;
    },
    userName() {
      return this.$store.getters.getUserName;
    },
    userRole() {
      return this.$store.getters.getUserRole; // Получаем роль пользователя
    },
    userPaid() {
      return this.$store.getters.getUserPaid; 
    },
    userEmail() {
      return this.$store.getters.getUserEmail; 
    },
    isUserAllowedToUpload(){
      if(this.userRole === 'uploader' || this.userRole === 'admin') {
        return true;
      }
      return false;
    },
    isAdmin(){
      if(this.userRole === 'admin') {
        return true;
      }
      return false;
    },
    isUserAuth(){
      if(this.Auth) {
        return true;
      }
      return false;
    }
  },
  methods: {

  },
};
