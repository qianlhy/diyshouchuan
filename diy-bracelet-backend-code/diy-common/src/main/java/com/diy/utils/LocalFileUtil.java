package com.diy.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Slf4j
public class LocalFileUtil {

    /**
     * 将配置中的 base-path 解析为绝对路径，避免 "." 导致上传与读取目录不一致
     */
    public static String resolveStorageRoot(String configuredBasePath) {
        if (configuredBasePath == null || configuredBasePath.trim().isEmpty() || ".".equals(configuredBasePath.trim())) {
            String jarDir = resolveJarDirectory();
            if (jarDir != null) {
                return jarDir;
            }
            return new File(System.getProperty("user.dir")).getAbsolutePath();
        }
        return new File(configuredBasePath.trim()).getAbsolutePath();
    }

    private static String resolveJarDirectory() {
        try {
            java.net.URL location = LocalFileUtil.class.getProtectionDomain().getCodeSource().getLocation();
            if (location == null) {
                return null;
            }
            File codeSource = new File(location.toURI());
            if (codeSource.isFile()) {
                return codeSource.getParentFile().getAbsolutePath();
            }
            if (codeSource.isDirectory()) {
                return codeSource.getAbsolutePath();
            }
        } catch (Exception e) {
            log.debug("无法解析 jar 目录，回退 user.dir: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 本地文件上传
     */
    public static String upload(MultipartFile file, String basePath, String module) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new IllegalArgumentException("文件名不能为空");
            }

            String fileName = UUID.randomUUID().toString()
                    + originalFilename.substring(originalFilename.lastIndexOf("."));
            String modulePath = module != null ? module + "/" : "";
            String storageRoot = resolveStorageRoot(basePath);
            String filePath = storageRoot + "/uploads/" + modulePath + fileName;

            File destFile = new File(filePath);
            if (!destFile.getParentFile().exists()) {
                destFile.getParentFile().mkdirs();
            }

            file.transferTo(destFile);

            String accessPath = "/admin/common/image/uploads/" + modulePath + fileName;
            log.info("文件上传成功: {} -> {}", accessPath, destFile.getAbsolutePath());
            return accessPath;
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败", e);
        }
    }

    /**
     * 本地保存字节数组为图片
     */
    public static String uploadBytes(byte[] bytes, String basePath, String module, String extension) {
        try {
            if (extension == null || extension.isEmpty()) {
                extension = ".jpg";
            }
            if (!extension.startsWith(".")) {
                extension = "." + extension;
            }
            String modulePath = module != null ? module + "/" : "";
            String fileName = UUID.randomUUID().toString() + extension;
            String storageRoot = resolveStorageRoot(basePath);
            String filePath = storageRoot + "/uploads/" + modulePath + fileName;

            File destFile = new File(filePath);
            if (!destFile.getParentFile().exists()) {
                destFile.getParentFile().mkdirs();
            }
            java.nio.file.Files.write(destFile.toPath(), bytes);

            String accessPath = "/admin/common/image/uploads/" + modulePath + fileName;
            log.info("字节文件上传成功: {} -> {}", accessPath, destFile.getAbsolutePath());
            return accessPath;
        } catch (IOException e) {
            log.error("字节文件上传失败", e);
            throw new RuntimeException("文件上传失败", e);
        }
    }

    /**
     * 根据数据库中的相对路径定位本地文件
     */
    public static File resolveLocalFile(String basePath, String cleanPath) {
        if (cleanPath == null || cleanPath.trim().isEmpty()) {
            return null;
        }
        String normalized = cleanPath.replace("\\", "/");
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.startsWith("admin/common/image/")) {
            normalized = normalized.substring("admin/common/image/".length());
        }

        for (String storageRoot : collectStorageRoots(basePath)) {
            File found = findInStorageRoot(storageRoot, normalized);
            if (found != null) {
                return found;
            }
        }
        return null;
    }

    private static java.util.List<String> collectStorageRoots(String basePath) {
        java.util.LinkedHashSet<String> roots = new java.util.LinkedHashSet<>();
        roots.add(resolveStorageRoot(basePath));
        String userDir = new File(System.getProperty("user.dir")).getAbsolutePath();
        roots.add(userDir);
        String jarDir = resolveJarDirectory();
        if (jarDir != null) {
            roots.add(jarDir);
        }
        return new java.util.ArrayList<>(roots);
    }

    private static File findInStorageRoot(String storageRoot, String normalized) {
        File direct = new File(storageRoot, normalized);
        if (direct.isFile()) {
            return direct;
        }

        if (normalized.startsWith("uploads/")) {
            File withoutPrefix = new File(storageRoot, normalized.substring("uploads/".length()));
            if (withoutPrefix.isFile()) {
                return withoutPrefix;
            }
        } else {
            File withPrefix = new File(storageRoot, "uploads/" + normalized);
            if (withPrefix.isFile()) {
                return withPrefix;
            }
        }
        return null;
    }
}
