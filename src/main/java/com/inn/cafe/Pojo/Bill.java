package com.inn.cafe.Pojo;

import jakarta.persistence.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@DynamicInsert
@DynamicUpdate
@Table(name = "bill_tbl")
public class Bill implements Serializable {
    public static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "uuid")
    private String uuid;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "total")
    private Integer total;

    @Column(name = "product_detail", columnDefinition = "TEXT")
    private String productDetail;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "bill_created_dttm")
    private LocalDateTime billCreatedDttm;

    public Bill() {
    }

    public Bill(Integer id, String name, String uuid, String email, String contactNumber, String paymentMethod, Integer total, String productDetail, String createdBy, LocalDateTime billCreatedDttm) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
        this.email = email;
        this.contactNumber = contactNumber;
        this.paymentMethod = paymentMethod;
        this.total = total;
        this.productDetail = productDetail;
        this.createdBy = createdBy;
        this.billCreatedDttm = billCreatedDttm;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public String getProductDetail() {
        return productDetail;
    }

    public void setProductDetail(String productDetail) {
        this.productDetail = productDetail;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getBillCreatedDttm() {
        return billCreatedDttm;
    }

    public void setBillCreatedDttm(LocalDateTime billCreatedDttm) {
        this.billCreatedDttm = billCreatedDttm;
    }
}
