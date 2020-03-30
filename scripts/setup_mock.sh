git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git hapi-fhir-jpaserver
cd hapi-fhir-jpaserver
#checkout specific commit to stabilize pipeline
git checkout 38c711dabfa5433036a949be639b769f47d122c9
sed -i -e 's/config.addAllowedHeader(HttpHeaders.ORIGIN);/config.addAllowedHeader(HttpHeaders.ORIGIN);config.addAllowedHeader(HttpHeaders.IF_MATCH);config.addAllowedHeader("x-csrf-token");/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/\/fhir\//\/fhir\/R4\//g' src/main/webapp/WEB-INF/web.xml
sed -i -e 's/server_address=http:\/\/localhost:8080\/hapi-fhir-jpaserver\/fhir\//server_address=http:\/\/localhost:8080\/fhir\/R4\//g' src/main/resources/hapi.properties
sed -i -e 's/<contextPath>\/hapi-fhir-jpaserver<\/contextPath>/<contextPath>\/<\/contextPath>/g' pom.xml
sed -i -e 's/\/var\/lib\/jetty\/webapps\/hapi-fhir-jpaserver.war/\/var\/lib\/jetty\/webapps\/root.war/g' Dockerfile
mvn clean install -DskipTests -q
docker build -t hapi-fhir-jpaserver .
docker run -p 8080:8080 -d hapi-fhir-jpaserver
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080)" != "200" ]]; do sleep 1; done'
cd ..
rm -rf hapi-fhir-jpaserver/
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/StructureDefinition.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/CodeSystem.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/ValueSet.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/Encounter.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/Patient.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/Practitioner.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/PractitionerRole.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/Organization.json --header "Content-Type: application/json"
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/Coverage.json --header "Content-Type: application/json"
# update a specific patient to test versioning
curl -v POST http://localhost:8080/fhir/R4/ -d @test/data/update-patient.json --header "Content-Type: application/json"
