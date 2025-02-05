<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Galerie</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Galerie</ion-title>
        </ion-toolbar>
      </ion-header>
        <p>{{value}}</p>
        <div id="outerbox" >
          <ImagePreview 
            id="inner-div" 
            v-for="image in test" 
            :key="image.id" 
            :root="'http://localhost:3000/pictures/'+image.path" 
            :fieldId="image.id"
            :checked="value.includes(image.id)"
            @update:checked="check(image.id, $event)"
          />
        </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import ImagePreview from '@/components/ImagePreview.vue';

</script>
<script lang="ts">
import { defineComponent } from 'vue';
import { getPhotoGallery } from '@/composables/getPhotoGallery';

const { get } = getPhotoGallery();
export default defineComponent({

  data() {
    return {
      test: null,
      value: []
    }
  },
  methods: {
    check: function (optionId:number, checked:boolean) {
      const updatedValue: Array<number> = this.value;
      if (checked) {
        updatedValue.push(optionId);
      } else {
        updatedValue.splice(updatedValue.indexOf(optionId), 1);
      }
    }
  },
  async created() {
    this.test = await get()
  },
})


</script>

<style scoped>
#outerbox{
  width: 100%;
  padding: 30px;
  text-align: center;
}

#inner-div{
  display: inline-block;
  padding: 50px;
}
</style>