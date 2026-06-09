package com.diy.service;

import com.diy.utils.LocalFileUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * DIY 下单截图：仅保存到服务器本地，上传与读取共用同一目录。
 */
@Service
@Slf4j
public class DiyDesignStorageService {

    private static final Pattern SAFE_FILE_NAME = Pattern.compile(
            "^[0-9a-fA-F\\-]+\\.(jpg|jpeg|png|webp)$"
    );

    public static final String ACCESS_PATH_PREFIX = "/admin/common/image/uploads/diy_design/";

    @Value("${local.file.base-path}")
    private String basePath;

    @Value("${local.file.diy-design-dir:}")
    private String diyDesignDir;

    private File storageDir;

    @PostConstruct
    public void init() {
        if (diyDesignDir != null && !diyDesignDir.trim().isEmpty()) {
            storageDir = new File(diyDesignDir.trim());
        } else {
            storageDir = new File(LocalFileUtil.resolveStorageRoot(basePath), "uploads/diy_design");
        }
        if (!storageDir.exists() && !storageDir.mkdirs()) {
            log.warn("创建 DIY 设计图目录失败: {}", storageDir.getAbsolutePath());
        }
        log.info("DIY 设计图存储目录: {}", storageDir.getAbsolutePath());
    }

    public String save(byte[] bytes, String extension) throws IOException {
        String ext = normalizeExtension(extension);
        String fileName = UUID.randomUUID().toString() + ext;
        File destFile = new File(storageDir, fileName);
        Files.write(destFile.toPath(), bytes);
        log.info("DIY 设计图上传成功: {} -> {}", ACCESS_PATH_PREFIX + fileName, destFile.getAbsolutePath());
        return ACCESS_PATH_PREFIX + fileName;
    }

    public File resolve(String fileName) {
        if (!isSafeFileName(fileName)) {
            return null;
        }

        File direct = new File(storageDir, fileName);
        if (direct.isFile()) {
            return direct;
        }

        return LocalFileUtil.resolveLocalFile(basePath, "uploads/diy_design/" + fileName);
    }

    public String extractFileName(String storedPath) {
        if (storedPath == null || storedPath.trim().isEmpty()) {
            return null;
        }
        String normalized = storedPath.trim().replace("\\", "/");
        int index = normalized.lastIndexOf("/uploads/diy_design/");
        if (index >= 0) {
            return normalized.substring(index + "/uploads/diy_design/".length());
        }
        if (normalized.startsWith("uploads/diy_design/")) {
            return normalized.substring("uploads/diy_design/".length());
        }
        int slash = normalized.lastIndexOf('/');
        if (slash >= 0 && slash < normalized.length() - 1) {
            String name = normalized.substring(slash + 1);
            return isSafeFileName(name) ? name : null;
        }
        return isSafeFileName(normalized) ? normalized : null;
    }

    public boolean isServerStoredPath(String path) {
        return path != null && path.contains("/uploads/diy_design/");
    }

    private boolean isSafeFileName(String fileName) {
        return fileName != null && SAFE_FILE_NAME.matcher(fileName).matches();
    }

    private String normalizeExtension(String extension) {
        if (extension == null || extension.trim().isEmpty()) {
            return ".jpg";
        }
        String ext = extension.trim();
        if (!ext.startsWith(".")) {
            ext = "." + ext;
        }
        return ext.toLowerCase();
    }
}
