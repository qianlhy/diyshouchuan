<template>
  <view class="page">
    <view class="content">
      <view class="title">隐私政策</view>
      <view class="update-time">更新日期：2026年5月31日</view>

      <view class="section">
        <view class="section-title">一、我们如何收集和使用您的信息</view>
        <view class="paragraph">为向您提供手串定制、下单、支付及配送服务，我们可能收集以下信息：</view>
        <view class="paragraph">1. 微信登录信息：包括 openid，用于识别您的账号并完成登录。</view>
        <view class="paragraph">2. 用户资料：您主动填写的昵称、头像，用于个人中心展示。</view>
        <view class="paragraph">3. 订单信息：收货地址、联系方式、订单内容，用于完成交易与配送。</view>
        <view class="paragraph">4. 设计信息：您在手串制作台生成的设计图及搭配信息，用于订单制作。</view>
      </view>

      <view class="section">
        <view class="section-title">二、信息的存储与保护</view>
        <view class="paragraph">我们采取合理措施保护您的个人信息，防止未经授权访问、披露或丢失。您的信息仅用于本小程序相关服务，不会用于与服务无关的目的。</view>
      </view>

      <view class="section">
        <view class="section-title">三、信息的共享</view>
        <view class="paragraph">除法律法规要求或经您明确同意外，我们不会向第三方出售或非法提供您的个人信息。为完成支付、物流配送，必要信息会提供给微信支付及物流服务商。</view>
      </view>

      <view class="section">
        <view class="section-title">四、您的权利</view>
        <view class="paragraph">您有权查询、更正或删除您的个人信息，也可通过联系客服申请注销账号或撤回授权。</view>
      </view>

      <view class="section">
        <view class="section-title">五、联系我们</view>
        <view class="paragraph">如对本隐私政策有任何疑问，请通过小程序内「联系客服」与我们取得联系。</view>
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
