package com.diy.service;

import com.alibaba.fastjson.JSONObject;
import com.diy.properties.WeChatProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 获取小程序 access_token（用于发货信息管理等开放接口）
 */
@Service
@Slf4j
public class WeChatAccessTokenService {

    private static final String TOKEN_URL =
            "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s";

    @Autowired
    private WeChatProperties weChatProperties;

    private volatile String cachedToken;
    private volatile long expireAtMs;

    public synchronized String getAccessToken() {
        long now = System.currentTimeMillis();
        if (cachedToken != null && now < expireAtMs) {
            return cachedToken;
        }

        String url = String.format(TOKEN_URL, weChatProperties.getAppid(), weChatProperties.getSecret());
        RestTemplate restTemplate = new RestTemplate();
        String body = restTemplate.getForObject(url, String.class);
        JSONObject json = JSONObject.parseObject(body);
        if (json == null) {
            throw new IllegalStateException("获取 access_token 失败：响应为空");
        }
        if (json.containsKey("errcode") && json.getIntValue("errcode") != 0) {
            throw new IllegalStateException("获取 access_token 失败：" + body);
        }

        cachedToken = json.getString("access_token");
        int expiresIn = json.getIntValue("expires_in");
        expireAtMs = now + Math.max(0, expiresIn - 300) * 1000L;
        log.info("刷新小程序 access_token 成功，有效期约 {} 秒", expiresIn);
        return cachedToken;
    }
}
