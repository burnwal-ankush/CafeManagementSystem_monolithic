package com.inn.cafe.serviceImpl;

import com.inn.cafe.Constants.CafeConstants;
import com.inn.cafe.Dao.BillDao;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.Pojo.Bill;
import com.inn.cafe.service.BillService;
import com.inn.cafe.utils.CafeUtils;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.io.IOUtils;
import org.json.JSONArray;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
public class BillServiceImpl implements BillService {

    Logger log = LoggerFactory.getLogger(BillServiceImpl.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss");
    @Autowired
    BillDao billDao;

    @Autowired
    JwtFilter jwtFilter;

    @Override
    public ResponseEntity<String> generateBill(Map<String, Object> requestMap) {
        log.info("Started generating the report");
        try {
            String fileName;
            if (validateBillRequestMap(requestMap)) {
                Boolean isGenerate = (Boolean) requestMap.getOrDefault("isGenerate", true);
                if (!isGenerate) {
                    fileName = (String) requestMap.get("uuid");
                } else {
                    fileName = CafeUtils.getUUID();
                    requestMap.put("uuid", fileName);
                    insertBill(requestMap);
                }
                String data = "Name: " + requestMap.get("name") + "\n" +
                        "Contact Number: " + requestMap.get("contactNumber") + "\n" +
                        "Email: " + requestMap.get("email") + "\n" +
                        "Payment Method : " + requestMap.get("paymentMethod") + "\n" +
                        "Bill Created on :" + LocalDateTime.now().format(formatter);

                Document document = new Document();
                PdfWriter.getInstance(document, new FileOutputStream(CafeConstants.STORE_LOCATION + File.separator + fileName + ".pdf"));
                document.open();
                setRectangleInPdf(document);
                Paragraph chunk = new Paragraph("Cafe Management System", getFont("Header"));
                chunk.setAlignment(Element.ALIGN_CENTER);
                document.add(chunk);

                Paragraph dataChunk = new Paragraph(data + "\n \n", getFont("Data"));
                document.add(dataChunk);

                PdfPTable table = new PdfPTable(5);
                table.setWidthPercentage(100);
                setTableHeader(table);

                JSONArray jsonArray = null;
                Object productDetails = requestMap.get("productDetails");
                if (productDetails instanceof String) {
                    jsonArray = CafeUtils.getJsonArrayFromString((String) productDetails);
                } else if (productDetails instanceof List) {
                    jsonArray = new JSONArray((List<?>) productDetails);
                } else {
                    throw new IllegalArgumentException("Invalid productDetails format");
                }

                for (int i = 0; i < jsonArray.length(); i++) {
                    addRows(table, CafeUtils.getMapFromJson(jsonArray.getString(i)));
                }
                document.add(table);

                Paragraph footer = new Paragraph("\n \nTotal: " + requestMap.get("totalAmount") + "\n"
                        + "Thank you for visiting. Please visit again!!!", getFont("Footer"));

                document.add(footer);
                document.close();
                log.info("Report generated successfully!!!");
                return CafeUtils.getResponseEntity("{\"Report generated successfully!!! UUID\":\"" + fileName + "\"}", HttpStatus.OK);

            } else {
                return CafeUtils.getResponseEntity("Required data not found", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error occurred while generating report: {}", e.getMessage());
            return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<List<Bill>> getBills() {
        try {
            List<Bill> bills = new ArrayList<>();
            if (jwtFilter.isAdmin()) {
                bills = billDao.getAllBills();
            } else {
                bills = billDao.getBillByUserName(jwtFilter.getCurrentUser());
            }
            return new ResponseEntity<>(bills, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @Override
    public ResponseEntity<byte[]> getPdf(Map<String, Object> requestMap) {
        log.info("Inside getPdf : requestMap {}", requestMap);
        try {
            byte[] bytes = new byte[0];
            if(!requestMap.containsKey("uuid") && validateBillRequestMap(requestMap))
                return new ResponseEntity<>(bytes, HttpStatus.BAD_REQUEST);
            String filePath = CafeConstants.STORE_LOCATION +"\\" + (String)requestMap.get("uuid") + ".pdf";
            if(CafeUtils.isFileExists(filePath))
            {
                bytes = getByteArray(filePath);
                return new ResponseEntity<>(bytes,HttpStatus.OK);
            }
            else {
                requestMap.put("isGenerate",false);
                generateBill(requestMap);
                getByteArray(filePath);
                return new ResponseEntity<>(bytes,HttpStatus.OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private byte[] getByteArray(String filePath) throws Exception{
        File initial = new File(filePath);
        InputStream targetStream = new FileInputStream(initial);
        byte[] bytes = IOUtils.toByteArray(targetStream);
        targetStream.close();
        return bytes;
    }


    private void addRows(PdfPTable table, Map<String, Object> data) {
        table.addCell((String) data.get("name"));
        table.addCell((String) data.get("category"));
        table.addCell((String) data.get("quantity"));
        table.addCell(Double.toString((Double) data.get("price")));
        table.addCell(Double.toString((Double) data.get("total")));
    }

    private void setTableHeader(PdfPTable table) {
        Stream.of("Name", "Category", "Quantity", "Price", "Sub Total")
                .forEach(columnTitle -> {
                    PdfPCell header = new PdfPCell();
                    header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                    header.setBorderWidth(2);
                    header.setPhrase(new Phrase(columnTitle));
                    header.setBackgroundColor(BaseColor.YELLOW);
                    header.setHorizontalAlignment(Element.ALIGN_CENTER);
                    header.setVerticalAlignment(Element.ALIGN_CENTER);
                    table.addCell(header);
                });
    }

    private Font getFont(String type) {
        switch (type) {
            case "Header":
                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLDOBLIQUE, 18, BaseColor.BLACK);
                headerFont.setStyle(Font.BOLD);
                return headerFont;
            case "Data":
                Font dataFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 11, BaseColor.BLACK);
                dataFont.setStyle(Font.BOLD);
                return dataFont;
            case "Footer":
                Font footerFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 13, BaseColor.BLACK);
                footerFont.setStyle(Font.BOLD);
                return footerFont;
            default:
                return new Font();
        }
    }

    private void setRectangleInPdf(Document document) throws DocumentException {
        Rectangle rectangle = new Rectangle(577, 825, 18, 15);
        rectangle.enableBorderSide(1);
        rectangle.enableBorderSide(2);
        rectangle.enableBorderSide(4);
        rectangle.enableBorderSide(8);
        rectangle.setBorderColor(BaseColor.BLACK);
        rectangle.setBorderWidth(1);
        document.add(rectangle);
    }

    private void insertBill(Map<String, Object> requestMap) {
        try {
            log.info("Inserting into bill table");
            Bill bill = new Bill();
            bill.setUuid((String) requestMap.get("uuid"));
            bill.setName((String) requestMap.get("name"));
            bill.setEmail((String) requestMap.get("email"));
            bill.setContactNumber((String) requestMap.get("contactNumber"));
            bill.setPaymentMethod((String) requestMap.get("paymentMethod"));
            bill.setBillCreatedDttm(LocalDateTime.now());
            bill.setProductDetail((String) requestMap.get("productDetails"));
            bill.setTotal(Integer.parseInt(requestMap.get("totalAmount").toString()));
            String currentUser = jwtFilter.getCurrentUser();
            System.out.println("Current User: " + currentUser);
            bill.setCreatedBy(currentUser);
            billDao.save(bill);
            log.info("Inserted into bill table properly");
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error occurred while inserting bill: {}", e.getMessage());
        }
    }

    private boolean validateBillRequestMap(Map<String, Object> requestMap) {
        return (requestMap.containsKey("name") && requestMap.containsKey("contactNumber")
                && requestMap.containsKey("email") && requestMap.containsKey("paymentMethod")
                && requestMap.containsKey("productDetails") && requestMap.containsKey("totalAmount"));
        //&& requestMap.containsKey("billCreatedDttm"));
    }
}
