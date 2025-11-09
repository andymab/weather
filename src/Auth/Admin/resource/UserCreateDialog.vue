<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Добавить пользователя</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Имя *"
                :rules="[v => !!v || 'Имя обязательно']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                label="Email *"
                type="email"
                :rules="[
                  v => !!v || 'Email обязателен',
                  v => /.+@.+\..+/.test(v) || 'Email должен быть валидным'
                ]"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.role"
                :items="roles"
                item-title="name"
                item-value="value"
                label="Роль *"
                :rules="[v => !!v || 'Роль обязательна']"
                required
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                label="Пароль *"
                type="password"
                :rules="[v => !!v || 'Пароль обязателен']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-checkbox
                v-model="form.paid"
                label="Оплачено"
              ></v-checkbox>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.payment_time"
                label="Дата оплаты"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
        <small>* обязательные поля</small>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          :loading="loading"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "../../api"

export default {
  name: 'UserCreateDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    roles: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue', 'refresh', 'close'],

  data() {
    return {
      valid: true,
      loading: false,
      form: {
        name: '',
        email: '',
        role: '',
        password: '',
        paid: false,
        payment_time: null
      }
    }
  },

  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    async save() {
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) {
        return
      }

      this.loading = true

      try {
        await api.createUserWithPassword(this.form)
        
        this.$toast.success('Пользователь успешно создан')
        this.$emit('refresh')
        this.close()
        this.resetForm()
        
      } catch (error) {
        console.error('Ошибка при создании пользователя:', error)
        this.$toast.error(error.response?.data?.message || 'Ошибка при создании пользователя')
      } finally {
        this.loading = false
      }
    },

    close() {
      this.dialog = false
      this.$emit('close')
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        role: '',
        password: '',
        paid: false,
        payment_time: null
      }
      this.$refs.form?.resetValidation()
    }
  },

  watch: {
    dialog(val) {
      if (!val) {
        this.resetForm()
      }
    }
  }
}
</script>