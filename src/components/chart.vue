<template>
  <div class="chart__wrapper" :style="{'--radiusOut' : radiusOut + 'px', '--radiusIn' : radiusIn + 'px', '--lineHeight' : textSize + 'px'}">
    <div class="donut__chart" ref="donutChart" >
      <div class="donut__slice slice__one" ref="sliceOne" ></div>
      <div class="donut__slice slice__two" ref="sliceTwo"></div>
      <div class="chart__center" ref="chartCenter">
          <span class="chart__title" ref="perTitle">
          </span>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
export default {
  name: 'chart',
  props: {
    fullText :{type : Boolean, required: true},
    radiusOut : {type: String, required: true},
    radiusIn : {type: String, required: true},
    per: { required: true },
    color: { type: String, required: false, default: '#726A95' },
    colorBg: { type: String, required: false, default: '#e1e1e1' },
    /** text size in px (default: 32px) */
    textSize: { type: String, required: false, default: '32' },
  },
  setup(props) {
    const donutChart = ref(null);
    const sliceOne = ref(null);
    const sliceTwo = ref(null);
    const chartCenter = ref(null);
    const perTitle = ref(null);
    const getChartLine = () => {
      const per = parseFloat(props.per) > 100 ? 100 : parseFloat(props.per);
      let textSize = props.textSize + 'px';
      let base = props.colorBg;
      let color = props.color;
      let deg = (per / 100) * 360 + 'deg';
      let deg1 = '90deg';
      let deg2 = deg;
      let base2 = base;
      let center = '#fff';
      let color2 = color;
      let textColor = '2B2B2B';
      if (per < 50) {
        deg1 = (per / 100) * 360 + 90 + 'deg';
        deg2 = '0deg';
        base = color;
        color = base2;
        color2 = base2;
      }
      donutChart.value.style.background = base;
      sliceOne.value.style.transform = 'rotate(' + deg1 + ')';
      sliceOne.value.style.background = color;
      sliceTwo.value.style.transform = 'rotate(' + deg2 + ')';
      sliceTwo.value.style.background = color2;
      chartCenter.value.style.background = center;

      props.fullText ? perTitle.value.innerHTML = parseFloat(props.per) + perTitle.value.innerHTML + '%'  + ' Оценка Y' : perTitle.value.innerHTML = parseFloat(props.per) +'%';

      perTitle.value.style.color = textColor;
      perTitle.value.style.fontSize = textSize;
    };
    onMounted(() => {
      getChartLine();
    });
    return {
      donutChart,
      sliceOne,
      sliceTwo,
      chartCenter,
      perTitle,
    };
  },
};
</script>

<style scoped>


.chart__wrapper {
  float: left;
  background: #fff;
  border-radius: 50%;
}
.donut__chart {
  width: var(--radiusOut);
  height: var(--radiusOut);
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}
.donut__chart .chart__center {
  position: absolute;
  border-radius: 50%;
  top: var(--radiusIn);
  left: var(--radiusIn);
  width: calc(var(--radiusOut) - (var(--radiusIn) * 2));
  height: calc(var(--radiusOut) - (var(--radiusIn) * 2));
}
.donut__chart .donut__slice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.donut__chart .donut__slice.slice__one {
  clip: rect(0 var(--radiusOut) calc(var(--radiusOut) / 2) 0);
}
.donut__chart .donut__slice.slice__two {
  clip: rect(0 calc(var(--radiusOut) / 2) var(--radiusOut) 0);
}
.chart__center{
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut__chart > .chart__center > span {
  display: block;
  text-align: center;
  font-weight: bold;
  line-height: var(--lineHeight);


}
.chart__title {
  user-select: none;
  font-family: inherit;
  color: #4a4a4a;
}



</style>