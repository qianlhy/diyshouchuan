package com.diy.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.diy.entity.Orders;
import com.diy.entity.User;
import com.diy.properties.WeChatProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * 同步发货信息到微信小程序「交易结算管理」
 * 不上传则微信会冻结该笔订单资金（商户端显示不可用余额）
 */
@Service
@Slf4j
public class WeChatOrderShippingService {

    private static final String UPLOAD_URL =
            "https://api.weixin.qq.com/wxa/sec/order/upload_shipping_info?access_token=%s";

    @Autowired
    private WeChatAccessTokenService accessTokenService;

    @Autowired
    private WeChatProperties weChatProperties;

    public void uploadShippingInfo(Orders order, User user, String trackingNumber, String itemDesc) {
        if (order == null) {
            return;
        }
        if (trackingNumber == null || trackingNumber.trim().isEmpty()) {
            log.warn("订单 {} 未填写物流单号，跳过微信发货同步", order.getOrderNo());
            return;
        }
        if (user == null || user.getOpenid() == null || user.getOpenid().trim().isEmpty()) {
            log.warn("订单 {} 缺少用户 openid，跳过微信发货同步", order.getOrderNo());
            return;
        }

        try {
            JSONObject orderKey = new JSONObject();
            orderKey.put("order_number_type", 1);
            orderKey.put("mchid", weChatProperties.getMchid());
            orderKey.put("out_trade_no", order.getOrderNo());

            JSONObject shippingItem = new JSONObject();
            shippingItem.put("tracking_no", trackingNumber.trim());
            shippingItem.put("express_company", guessExpressCompany(trackingNumber));
            shippingItem.put("item_desc", itemDesc != null && !itemDesc.trim().isEmpty()
                    ? itemDesc.trim() : "手串DIY定制商品");

            JSONArray shippingList = new JSONArray();
            shippingList.add(shippingItem);

            JSONObject payer = new JSONObject();
            payer.put("openid", user.getOpenid());

            JSONObject payload = new JSONObject();
            payload.put("order_key", orderKey);
            payload.put("logistics_type", 1);
            payload.put("delivery_mode", 1);
            payload.put("shipping_list", shippingList);
            payload.put("upload_time", OffsetDateTime.now(ZoneOffset.ofHours(8))
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")));
            payload.put("payer", payer);

            String accessToken = accessTokenService.getAccessToken();
            String url = String.format(UPLOAD_URL, accessToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(payload.toJSONString(), headers);

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.postForObject(url, entity, String.class);
            JSONObject result = JSONObject.parseObject(response);
            if (result != null && result.getIntValue("errcode") == 0) {
                log.info("微信发货信息同步成功，订单号: {}, 运单号: {}", order.getOrderNo(), trackingNumber);
            } else {
                log.error("微信发货信息同步失败，订单号: {}, 响应: {}", order.getOrderNo(), response);
            }
        } catch (Exception e) {
            log.error("微信发货信息同步异常，订单号: {}", order.getOrderNo(), e);
        }
    }

    private String guessExpressCompany(String trackingNumber) {
        String no = trackingNumber == null ? "" : trackingNumber.trim().toUpperCase();
        if (no.startsWith("SF")) {
            return "SF";
        }
        if (no.startsWith("YT")) {
            return "YTO";
        }
        if (no.startsWith("JD")) {
            return "JD";
        }
        return "OTHER";
    }
}
