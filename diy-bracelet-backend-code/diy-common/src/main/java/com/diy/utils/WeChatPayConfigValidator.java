package com.diy.utils;

import com.diy.properties.WeChatProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * 启动时检查微信支付配置是否满足上线条件
 */
@Component
@Slf4j
public class WeChatPayConfigValidator {

    private static final String PLACEHOLDER_API_V3_KEY = "12345678910111213141516171819202";

    @Autowired
    private WeChatProperties weChatProperties;

    @EventListener(ApplicationReadyEvent.class)
    public void validateOnStartup() {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        checkRequired(errors, "appid", weChatProperties.getAppid());
        checkRequired(errors, "secret", weChatProperties.getSecret());
        checkRequired(errors, "mchid", weChatProperties.getMchid());
        checkRequired(errors, "mchSerialNo", weChatProperties.getMchSerialNo());
        checkRequired(errors, "privateKeyFilePath", weChatProperties.getPrivateKeyFilePath());
        checkRequired(errors, "apiV3Key", weChatProperties.getApiV3Key());
        checkRequired(errors, "weChatPayPublicKeyId", weChatProperties.getWeChatPayPublicKeyId());
        checkRequired(errors, "weChatPayPublicKeyPath", weChatProperties.getWeChatPayPublicKeyPath());
        checkRequired(errors, "notifyUrl", weChatProperties.getNotifyUrl());

        if (PLACEHOLDER_API_V3_KEY.equals(weChatProperties.getApiV3Key())) {
            warnings.add("apiV3Key 仍为占位值，请在微信支付商户平台设置真实 APIv3 密钥并更新配置");
        } else if (weChatProperties.getApiV3Key().length() != 32) {
            errors.add("apiV3Key 必须为 32 位字符串");
        }

        if (weChatProperties.getWeChatPayPublicKeyId() != null
                && weChatProperties.getWeChatPayPublicKeyId().contains("1734348120")) {
            warnings.add("weChatPayPublicKeyId 仍指向旧商户号 1734348120，请更换为新商户 1113372390 的公钥ID");
        }

        if (weChatProperties.getMchid() != null && !"1113372390".equals(weChatProperties.getMchid())) {
            warnings.add("mchid 与当前 API 证书商户号 1113372390 不一致，请确认配置");
        }

        if (weChatProperties.getMchSerialNo() != null
                && !"1DB1C2BB67D22630424DB20963F1BA6174783BD2".equalsIgnoreCase(weChatProperties.getMchSerialNo())) {
            warnings.add("mchSerialNo 与当前 apiclient_cert.pem 序列号不一致，请从商户平台核对");
        }

        String privateKeyPath = CertPathResolver.resolve(weChatProperties.getPrivateKeyFilePath());
        String publicKeyPath = CertPathResolver.resolve(weChatProperties.getWeChatPayPublicKeyPath());
        checkFileExists(errors, "商户私钥", privateKeyPath);
        checkFileExists(errors, "微信支付公钥", publicKeyPath);
        if (Files.exists(Paths.get(privateKeyPath))) {
            log.info("商户私钥路径: {}", privateKeyPath);
        }
        if (Files.exists(Paths.get(publicKeyPath))) {
            log.info("微信支付公钥路径: {}", publicKeyPath);
        }

        if (weChatProperties.getNotifyUrl() != null) {
            if (!weChatProperties.getNotifyUrl().startsWith("https://")) {
                errors.add("notifyUrl 必须使用 HTTPS");
            }
            if (weChatProperties.getNotifyUrl().contains("tcloudbase.com")
                    || weChatProperties.getNotifyUrl().contains("cpolar")
                    || weChatProperties.getNotifyUrl().contains("ngrok")) {
                warnings.add("notifyUrl 仍为临时穿透/云托管地址，生产环境请改为正式域名");
            }
        }

        log.info("========== 微信支付配置检查 ==========");
        log.info("商户号: {}", weChatProperties.getMchid());
        log.info("证书序列号: {}", weChatProperties.getMchSerialNo());
        log.info("支付回调: {}", weChatProperties.getNotifyUrl());
        log.info("公钥ID: {}", weChatProperties.getWeChatPayPublicKeyId());

        warnings.forEach(item -> log.warn("[微信支付配置警告] {}", item));
        errors.forEach(item -> log.error("[微信支付配置错误] {}", item));

        if (errors.isEmpty() && warnings.isEmpty()) {
            log.info("[微信支付] 配置检查通过，可发起真实支付");
        } else if (errors.isEmpty()) {
            log.warn("[微信支付] 存在 {} 项警告，请尽快完善后再上线", warnings.size());
        } else {
            log.error("[微信支付] 存在 {} 项错误，真实支付将失败", errors.size());
        }
        log.info("======================================");
    }

    private void checkRequired(List<String> errors, String name, String value) {
        if (value == null || value.trim().isEmpty()) {
            errors.add(name + " 未配置");
        }
    }

    private void checkFileExists(List<String> errors, String label, String path) {
        if (path == null || path.trim().isEmpty()) {
            return;
        }
        if (!Files.exists(Paths.get(path))) {
            errors.add(label + " 文件不存在: " + path);
        }
    }
}
