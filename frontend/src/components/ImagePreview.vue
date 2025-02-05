<template>
  <div id="container">
    <ion-img id="image" :src="root"> </ion-img>
    <input
      @input="(event) => $emit('update:checked', event.target.checked)"
      type="checkbox"
      :checked="checked"
      :id="fieldId"
      class="mr-2 hidden"
    />
    
  </div>
</template>

<script setup lang="ts">
defineProps({
  root: String,
  fieldId: Number,
  checked: Boolean,
});
</script>
<script lang="ts">
import { IonImg } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { IonImg },
});
</script>
<style scoped>
#container{
  height: 22vw;
  width: 22vw;
  object-fit: cover;
}

#image{
  height: 22vw;
  width: 22vw;
  object-fit: cover;
  cursor: pointer;
  border-radius: 50%;
}
ion-img::part(image) {
  border-radius: 10%;

}
ion-img::part(image):hover {
  border-radius: 10%;
  height: 22.5vw;
  width: 22.5vw;
}
</style>
