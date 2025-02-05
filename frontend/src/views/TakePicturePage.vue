<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Take pictures</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 2 page"/>
    </ion-content>

    <ion-content :fullscreen="true">
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="takePhoto()">
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col size="6" :key="photo.filepath" v-for="photo in photos">
            <ion-img :src="photo.webviewPath"></ion-img>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-modal :is-open="isOpen">
        <ion-list>
          <ion-item fill="outline">
            <ion-label position="floating">Name your pictures</ion-label>
            <ion-input placeholder="Name" v-model="picturesName"></ion-input>
          </ion-item>
          <ion-item fill="outline">
            <ion-label position="floating">Add Tags</ion-label>
            <ion-input placeholder="Tag" v-model="tag"></ion-input>
          </ion-item>
          <ion-button @click="addTag()">Add</ion-button>
          <ion-item :key="tag" v-for="tag in tagList">
            <ion-text>{{tag}}</ion-text>
          </ion-item>
        </ion-list>
        <ion-fab-button @click="registerUpdate()">Enregistrer
        </ion-fab-button>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import ExploreContainer from '@/components/ExploreContainer.vue';
import { camera } from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonFab,
  IonFabButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonModal,
  IonList,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  onIonViewWillEnter,
  IonText
} from '@ionic/vue';

import { usePhotoGallery } from '@/composables/usePhotoGallery';
import { ref } from 'vue';

const { photos, takePhoto, updatePicture, isOpen, lastPhoto } = usePhotoGallery();
const picturesName = ref('');
const tagList = ref<string []>([]);
const tag = ref('');
// onIonViewWillEnter(takePhoto)

const registerUpdate = () => {
  if (picturesName.value.length >= 2 && picturesName.value.length <= 30)
  updatePicture(lastPhoto.value.id, picturesName.value, tagList.value); 
  isOpen.value = false; 
  tagList.value = []; 
  picturesName.value = '';
}

const addTag = () => {
  if (tag.value.length >= 2 && tag.value.length <= 30) {
    tagList.value.push(tag.value)
    tag.value = ''
  }
}
</script>
