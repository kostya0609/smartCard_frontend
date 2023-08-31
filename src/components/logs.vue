<template>
    <div
        v-loading = "loading"
        element-loading-text="Загрузка данных..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="history" stripe  class="logs-table" height="600" :show-header="false">
        <el-table-column prop="date" width="140"
        >
          <template #default="scope">
            {{formatDate(scope.row.date)}}
          </template>
        </el-table-column>
        <el-table-column prop="event">
          <template #default="scope">
            {{(scope.row.event)}}
            <br/> {{scope.row.comment}}
          </template>
        </el-table-column>
        <el-table-column width="70">
          <template #default="scope">
            <span class="userPhoto">
              <a :href="scope.row.user.link">
                <img :src="scope.row.user.photo" alt="фото"/>
              </a>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

</template>

<script>
import moment from 'moment'
import {inject, ref, reactive} from 'vue'
export default {
  name: "logs",
  props : ['typeId'],
  setup(props){

    const smartCardId       = inject('smartCardId');
    const smartCardStatus   = inject('smartCardStatus');
    const processStatusCard = inject('processStatusCard');
    const processStatusPlan = inject('processStatusPlan');
    const loadJson          = inject('loadJson');
    const svg               = inject('svg');
    const notify            = inject('notify');

    let loading             = ref(false);
    const history           = reactive([]);

    async function getData(){
      let process_id = props.typeId ? processStatusCard[smartCardStatus.value] : processStatusPlan[smartCardStatus.value];

      loading.value = true;
      //ниже запрашиваем основную историю по SMART
      let result = await loadJson('/smart-card/logs/get', {smartcard_id : smartCardId.value});

      if (result.status === 'success' && Array.isArray(result.data)) {
        history.length = 0;
        result.data.forEach(el => {
          history.push(el);
        })
      } else notify('Ошибка получения информации по SMART-карте', `При получении основной истории изменений по SMART-карте возникла ошибка!`, 'error');

      //ниже запрашиваем историю из модуля согласования и потом их объеденяем и сортируем
      result = await loadJson('/process/get-process-doc', {
        document_id: smartCardId.value,
        process_id
      });
      if (result.status === 'success' && result.data) {
        if (result.data.history) {
          result.data.history.forEach(el => history.push(
              {
                date    : el.created_at,
                event   : 'Решение : ' + el.result,
                comment : el.comment ? 'Комментарий : ' + el.comment : '',
                user    : el.user
              }
          ))
          history.sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
          });
        }
      }

      loading.value = false;
    }
    getData()

   return {history, loading, svg}
  },
  methods:{
    formatDate(date){
      return moment(date).format('DD.MM.YYYY  HH:mm')
    }
  }
}
</script>

<style scoped>

</style>