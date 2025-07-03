#!/bin/bash

echo "🔄 Sincronizando assets web con Capacitor..."
npm run sync

echo "📁 Proyecto Android listo en:"
echo "   Windows: E:\\pwa\\LICORES_ELBORRACHO\\android\\"
echo "   WSL2: /mnt/e/pwa/LICORES_ELBORRACHO/android/"

echo ""
echo "🚀 Siguiente paso:"
echo "   1. Abre Android Studio en Windows"
echo "   2. Open Project → E:\\pwa\\LICORES_ELBORRACHO\\android\\"
echo "   3. Run → Run 'app'"
echo ""
echo "✅ Sincronización completa!"