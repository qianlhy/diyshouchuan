package com.diy.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 解析微信支付证书路径：Docker 用 /app/certs，本地开发自动查找项目 certs 目录
 */
public final class CertPathResolver {

    private CertPathResolver() {
    }

    public static String resolve(String configuredPath) {
        if (configuredPath == null || configuredPath.trim().isEmpty()) {
            return configuredPath;
        }

        Path configured = Paths.get(configuredPath);
        if (Files.exists(configured)) {
            return configured.toString();
        }

        String fileName = configured.getFileName().toString();
        String[] candidates = {
                "certs/" + fileName,
                "../certs/" + fileName,
                "../../certs/" + fileName,
                "diy-bracelet-backend-code/certs/" + fileName
        };

        for (String candidate : candidates) {
            Path resolved = Paths.get(candidate).toAbsolutePath().normalize();
            if (Files.exists(resolved)) {
                return resolved.toString();
            }
        }

        return configuredPath;
    }
}
