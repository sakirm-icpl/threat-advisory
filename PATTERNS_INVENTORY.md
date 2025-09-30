# Patterns Inventory

This document provides an overview of the current patterns in the Version Detection Pattern Database and identifies potential areas for expansion.

## Current Patterns (27 total)

### Web Servers & Applications (12 patterns)
1. Apache HTTPD Server (apache.json)
2. Apache Traffic Server (apache-traffic-server.json)
3. Apache Answer (apache-answer.json)
4. Internet Information Services (microsoft-iis.json)
5. NGINX (nginx.json)
6. ModSecurity (modsecurity.json)
7. Kibana (kibana.json)
8. Argo CD (argocd.json)
9. Liferay Portal (liferay-portal.json)
10. Go Ethereum (go-ethereum.json)
11. ZenML (zenml.json)
12. Apiman (apiman.json)

### Networking (5 patterns)
1. Cisco IOS (cisco-ios.json)
2. OpenSSH (openssh.json)
3. Sami FTP Server (sami-ftp-server.json)
4. Slimftpd (slimftpd.json)
5. Blackmoon FTP Server (blackmoon-ftp-server.json)

### Database (3 patterns)
1. MySQL (mysql.json)
2. PostgreSQL (postgresql.json)
3. Couchbase Server (couchbase-server.json)

### Messaging (2 patterns)
1. RabbitMQ (rabbitmq.json)
2. Apache Pulsar (apache-pulsar.json)

### Content Management Systems (3 patterns)
1. Concrete CMS (concrete-cms.json)
2. Drupal (drupal.json)
3. WordPress (wordpress.json)

### Operating Systems (1 pattern)
1. Ubuntu (ubuntu.json)

### Frameworks (1 pattern)
1. Django (django.json)

## Potential Patterns to Add

### Web Servers & Applications
- Apache Tomcat
- Lighttpd
- Jetty
- Node.js/Express
- Ruby on Rails
- Spring Boot
- Flask
- FastAPI

### Networking
- Apache HTTP Server (different from HTTPD?)
- Nginx (additional patterns)
- HAProxy
- Varnish Cache
- Squid Proxy
- Apache Kafka
- Redis
- MongoDB

### Database
- MongoDB
- Redis
- Elasticsearch
- Microsoft SQL Server
- Oracle Database
- MariaDB
- SQLite
- Cassandra
- CouchDB

### Messaging
- Apache Kafka
- ActiveMQ
- ZeroMQ
- MQTT Brokers (Mosquitto, EMQX)
- NATS

### Content Management Systems
- Joomla
- Magento
- Ghost
- Strapi
- KeystoneJS

### Operating Systems
- CentOS
- Red Hat Enterprise Linux
- Debian
- Alpine Linux
- Windows Server
- macOS

### Frameworks
- Express.js
- Spring Framework
- Laravel
- Symfony
- Ruby on Rails
- ASP.NET
- Flask
- FastAPI

## Validation Status

All 27 current patterns have been validated and are working correctly.

## Next Steps

To expand the database:
1. Review the "Good First Issues" list for pattern suggestions
2. Research version detection methods for the software listed above
3. Create patterns following the established template
4. Add comprehensive test cases
5. Validate patterns using the provided tools