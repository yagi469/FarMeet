package com.farmeet.repository;

import com.farmeet.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByEmail(String email);

    Optional<OtpCode> findByPhoneNumber(String phoneNumber);

    void deleteByEmail(String email);
}
