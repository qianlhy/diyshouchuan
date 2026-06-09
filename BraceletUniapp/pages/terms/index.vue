<template>
  <view class="page">
    <view class="content">
      <view class="title">用户服务协议</view>
      <view class="update-time">更新日期：2026年5月31日</view>

      <view class="section">
        <view class="section-title">一、协议说明</view>
        <view class="paragraph">欢迎使用「拾光手串」小程序。在使用本服务前，请您仔细阅读并充分理解本协议。您勾选同意并完成登录，即表示您已阅读并同意本协议全部内容。</view>
      </view>

      <view class="section">
        <view class="section-title">二、服务内容</view>
        <view class="paragraph">本小程序为您提供手串 DIY 设计、成品选购、下单支付、订单查询及客服咨询等服务。具体功能以页面实际展示为准。</view>
      </view>

      <view class="section">
        <view class="section-title">三、用户行为规范</view>
        <view class="paragraph">您应保证所填写的信息真实、准确，不得利用本小程序从事违法违规活动，不得干扰平台正常运营。</view>
      </view>

      <view class="section">
        <view class="section-title">四、订单与支付</view>
        <view class="paragraph">您提交订单并完成支付后，订单将进入制作或发货流程。定制类商品因手工制作特性，具体发货时间以订单页面说明为准。</view>
      </view>

      <view class="section">
        <view class="section-title">五、免责声明</view>
        <view class="paragraph">因不可抗力、网络故障、第三方服务异常等非平台可控原因导致的服务中断或延迟，平台将在合理范围内协助处理，但不承担由此产生的间接损失。</view>
      </view>

      <view class="section">
        <view class="section-title">六、协议变更</view>
        <view class="paragraph">我们可能根据业务需要更新本协议，更新后将通过小程序页面提示。若您继续使用服务，即视为接受更新后的协议。</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F6F2;
  padding: 32rpx;
}

.content {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A3728;
  margin-bottom: 12rpx;
}

.update-time {
  font-size: 24rpx;
  color: #9a8b7a;
  margin-bottom: 32rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #4A3728;
  margin-bottom: 16rpx;
}

.paragraph {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 12rpx;
}
</style>
